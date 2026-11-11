const CONFIG_FILE_NAME = 'dominion-randomizer-config.json';
const APPDATA_FOLDER = 'appDataFolder';

const HISTORY_FILE_NAME = 'dominion-kingdom-history.json';


interface GoogleTokenResponse {
  access_token?: string;
  error?: string;
}

interface GoogleDriveFile {
  id: string;
  name: string;
  modifiedTime?: string;
}

interface GoogleDriveFilesResponse {
  files?: Array<GoogleDriveFile & { mimeType?: string }>;
}

export interface GoogleUserProfile {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
}

export function decodeGoogleCredential(credential: string): GoogleUserProfile {
  const base64Url = credential.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const json = decodeURIComponent(
    atob(base64)
      .split('')
      .map((char) => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`)
      .join('')
  );
  return JSON.parse(json) as GoogleUserProfile;
}

export interface GoogleBackupPayload {
  version: number;
  savedAt: string;
  data: {
    settingsStore: Record<string, unknown>;
    randomizerSettings: Record<string, unknown>;
    language?: string;
  };
}

export function getGoogleClientId(): string | undefined {
  const clientId = ( import.meta.env?.VITE_GOOGLE_CLIENT_ID || '').trim();
  return clientId || undefined;
}

export function isGoogleSyncAvailable(): boolean {
  return !!getGoogleClientId();
}

/**
 * Déclenche la pop-up Google pour obtenir un jeton d'accès tout neuf.
 */
export async function requestDriveAccessToken(hintEmail?: string, silent: boolean = false): Promise<string> {
  const clientId = getGoogleClientId();
  if (!clientId) {
    throw new Error('Missing VITE_GOOGLE_CLIENT_ID');
  }

  if (!window.google?.accounts?.oauth2) {
    await new Promise<void>((resolve, reject) => {
      const startTime = Date.now();
      const interval = setInterval(() => {
        if (window.google?.accounts?.oauth2) {
          clearInterval(interval);
          resolve();
        } else if (Date.now() - startTime > 10000) {
          clearInterval(interval);
          reject(new Error('Google Drive API is not available (timeout waiting for script to load)'));
        }
      }, 100);
    });
  }

  return new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'https://www.googleapis.com/auth/drive.appdata',
      prompt: '',
      callback: (response: GoogleTokenResponse) => {
       // console.log('Google Drive token response:', response);
        if (response.error) {
          reject(new Error(response.error));
          return;
        }

        if (response.access_token) {
          resolve(response.access_token);
        } else {
          reject(new Error('No access token returned by Google'));
        }
      },
      error_callback: (err: any) => {
        if (err && err.type === 'popup_closed') {
          reject(new Error('Authentication window was closed.'));
        } else {
          reject(err);
        }
      }
    });

    client.requestAccessToken({
      prompt: silent ? '' : 'select_account',
      hint: hintEmail || ''
    });
  });
}

export async function verifyDriveAccess(token: string): Promise<void> {
  const searchParams = new URLSearchParams({
    spaces: APPDATA_FOLDER,
    pageSize: '1',
    fields: 'files(id)',
  });
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?${searchParams.toString()}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!response.ok) {
    throw new Error(`Google Drive access check failed (${response.status})`);
  }
}

/**
 * Recherche le fichier en utilisant le jeton fourni par le Store
 */
async function findConfigFile(token: string): Promise<GoogleDriveFile | null> {
  const searchParams = new URLSearchParams({
    spaces: 'appDataFolder',
    fields: 'files(id,name,mimeType,modifiedTime)',
  });

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?${searchParams.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Google Drive search failed (${response.status}): ${errorText || 'Unknown error'}`
    );
  }

  const data = (await response.json()) as GoogleDriveFilesResponse & {
    files?: Array<GoogleDriveFile & { mimeType?: string }>;
  };

  return (
    data.files?.find(
      (file) =>
        file.name === CONFIG_FILE_NAME &&
        file.mimeType === 'application/json'
    ) || null
  );
}

/**
 * Sauvegarde le payload en utilisant le jeton fourni par le Store
 */
export async function saveConfigToGoogle(token: string, payload: GoogleBackupPayload): Promise<void> {
  const file = await findConfigFile(token);
  const json = JSON.stringify(payload);

  if (file) {
    const response = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${file.id}?uploadType=media`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: json,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update Google Drive backup (${response.status})`);
    }
    return;
  }

  const metadata = JSON.stringify({
    name: CONFIG_FILE_NAME,
    mimeType: 'application/json',
    parents: [APPDATA_FOLDER],
  });

  const boundary = 'foo_bar_baz';
  const multipartBody = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n${json}\r\n--${boundary}--\r\n`;

  const response = await fetch(
    `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartBody,
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to create Google Drive backup (${response.status})`);
  }
}

/**
 * Restaure la configuration en utilisant le jeton fourni par le Store
 */
export async function restoreConfigFromGoogle(token: string): Promise<GoogleBackupPayload | null> {
  const file = await findConfigFile(token);
  if (!file) {
    return null;
  }

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to read Google Drive backup (${response.status})`);
  }

  const text = await response.text();
  return JSON.parse(text) as GoogleBackupPayload;
}

/**
 * 🔍 Recherche le fichier d'historique dans le appDataFolder
 */
async function findHistoryFile(token: string): Promise<GoogleDriveFile | null> {
  const searchParams = new URLSearchParams({
    spaces: APPDATA_FOLDER,
    fields: 'files(id,name,mimeType,modifiedTime)',
  });

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?${searchParams.toString()}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Drive history search failed (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as GoogleDriveFilesResponse;
  return data.files?.find(file => file.name === HISTORY_FILE_NAME && file.mimeType === 'application/json') || null;
}

/**
 * 📥 Télécharge l'historique des jeux (dictionnaire hash -> timestamp) depuis Google Drive
 */
export async function fetchHistoryFromGoogle(token: string): Promise<Record<string, number | { timestamp: number; rating?: number }>> {
  const file = await findHistoryFile(token);
  if (!file) {
    return {}; // Premier lancement : aucun fichier créé, on renvoie un historique vide
  }

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to read Google Drive history (${response.status})`);
  }

  const text = await response.text();
  try {
    return JSON.parse(text) as Record<string, number | { timestamp: number; rating?: number }>;
  } catch {
    return {}; // En cas de fichier corrompu ou vide
  }
}

/**
 * 📤 Sauvegarde ou met à jour l'historique complet sur Google Drive
 */
export async function saveHistoryToGoogle(token: string, historyData: Record<string, number | { timestamp: number; rating?: number }>): Promise<void> {
  const file = await findHistoryFile(token);
  const json = JSON.stringify(historyData);

  // Cas 1 : Le fichier existe déjà, on fait une mise à jour rapide (PATCH)
  if (file) {
    const response = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${file.id}?uploadType=media`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: json,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update Google Drive history (${response.status})`);
    }
    return;
  }

  // Cas 2 : Le fichier n'existe pas, création en mode Multipart (POST)
  const metadata = JSON.stringify({
    name: HISTORY_FILE_NAME,
    mimeType: 'application/json',
    parents: [APPDATA_FOLDER],
  });

  const boundary = 'foo_bar_baz_history';
  const multipartBody = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n${json}\r\n--${boundary}--\r\n`;

  const response = await fetch(
    `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartBody,
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to create Google Drive history (${response.status})`);
  }
}

declare global {
  interface Window {
    __GOOGLE_ID_INIT_GUARD__?: boolean;
    google?: any;
  }
}

export function ensureGoogleIdInitGuard() {
  if (typeof window === 'undefined') {
    return;
  }

  if (window.__GOOGLE_ID_INIT_GUARD__) {
    return;
  }

  const googleIdApi = window.google?.accounts?.id;
  if (!googleIdApi) {
    window.setTimeout(ensureGoogleIdInitGuard, 250);
    return;
  }

  const originalInitialize = googleIdApi.initialize.bind(googleIdApi);
  let hasInitialized = false;

  googleIdApi.initialize = ((config: unknown) => {
    if (hasInitialized) {
      return;
    }
    hasInitialized = true;
    originalInitialize(config as never);
  }) as typeof googleIdApi.initialize;

  window.__GOOGLE_ID_INIT_GUARD__ = true;
}