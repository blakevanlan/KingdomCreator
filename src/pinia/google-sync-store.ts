import { defineStore } from 'pinia';
import { useSettingsStore } from '@/pinia/settings-store';
import { usei18nStore } from '@/pinia/i18n-store';
import { useRandomizerStore } from '@/pinia/randomizer-store';
import { useHistoryStore } from '@/pinia/history-store';

import { getLanguage } from '@/i18n/language';
import {
  isGoogleSyncAvailable,
  restoreConfigFromGoogle,
  saveConfigToGoogle,
  requestDriveAccessToken,
  verifyDriveAccess,
  decodeGoogleCredential,
  ensureGoogleIdInitGuard,
  type GoogleBackupPayload,
} from '@/utils/google-sync';

export interface GoogleSyncProfile {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
}

export const useGoogleSyncStore = defineStore('googleSyncStore', {
  state: () => ({
    isSignedIn: false,
    isDriveAccessVerified: false,
    profile: null as GoogleSyncProfile | null,
    accessToken: null as string | null, 
    tokenExpirationTime: null as number | null,
    isLoading: false,
    lastMessage: '' as string,
  }),
  persist: {
    // On ne persiste pas le token Drive, car il expire rapidement.
    pick: ['isSignedIn', 'profile', 'accessToken', 'tokenExpirationTime'],
  },
  actions: {
    async initialize() {
      // 1. On applique la protection globale sur l'API Google
      ensureGoogleIdInitGuard();

      if (!isGoogleSyncAvailable()) {
        this.lastMessage = 'Google sync is not configured.';
        return;
      }
      //console.log("Google sync is available. Checking for existing session...");
      //console.log("Current state:", {
      //   isSignedIn: this.isSignedIn,
      //   accessToken: this.accessToken,
      //   tokenExpirationTime: new Date(this.tokenExpirationTime || Date.now()).toLocaleTimeString(),
      // });
      // 2. Si l'utilisateur s'était déjà connecté lors d'une session précédente
      if (this.isSignedIn && this.accessToken && this.tokenExpirationTime) {
        try {
          const now = Date.now();
          const cachedToken = this.accessToken;
          if (now >= this.tokenExpirationTime - 120000) {
            throw new Error('Cached Google Drive token has expired.');
          }
          await verifyDriveAccess(cachedToken);
          this.isDriveAccessVerified = true;
          this.lastMessage = `Connected (loaded from session cache).`;
          await useHistoryStore().loadHistory();
          return;
        } catch {
          this.accessToken = null;
          this.tokenExpirationTime = null;
          this.isDriveAccessVerified = false;
        }
      }
      if (this.isSignedIn) {
        try {
          this.isLoading = true;
          // On récupère un token Drive frais sans ouvrir de pop-up 
          // (Google s'en souvient si la session globale de son navigateur est active)
          const token = await requestDriveAccessToken(this.profile?.email, true /* silent prompt */);
          await verifyDriveAccess(token);
          this.accessToken = token;
          this.tokenExpirationTime = Date.now() + 3600000;
          this.isDriveAccessVerified = true;
          await useHistoryStore().loadHistory();
          this.lastMessage = `Welcome back! Connected to Google Drive.`;
        } catch (error) {
          this.accessToken = null;
          this.tokenExpirationTime = null;
          this.isDriveAccessVerified = false;
          this.isSignedIn = false;
          console.warn("Auto-login Google Drive deferred:", error);
        } finally {
          this.isLoading = false;
        }
      }
    },

    // Appelée par le nouveau bouton bleu
    async signInAndInit() {
      this.isLoading = true;
      try {
        const token = await requestDriveAccessToken('', false /* silent prompt ? */);
        await verifyDriveAccess(token);
        this.accessToken = token;
        this.tokenExpirationTime = Date.now() + 3600000;
        this.isDriveAccessVerified = true;

        // 2. On profite de ce token pour aller chercher les infos de profil (nom, email, photo)
        const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          this.profile = {
            sub: profileData.sub,
            email: profileData.email,
            name: profileData.name,
            picture: profileData.picture
          };
          this.lastMessage = `Connected as ${this.profile.name} (${this.profile.email})`;
        } else {
          this.profile = { sub: 'unknown', email: 'Connected' };
          this.lastMessage = 'Connected to Google Drive.';
        }
        this.isSignedIn = true;
        await useHistoryStore().loadHistory();
      } catch (error) {
        this.accessToken = null;
        this.tokenExpirationTime = null;
        this.isDriveAccessVerified = false;
        this.isSignedIn = false;
        this.lastMessage = error instanceof Error ? error.message : 'Login failed.';
      } finally {
        this.isLoading = false;
      }
    },

    // Permet aux boutons Save/Restore d'utiliser le token existant ou de le recréer si expiré
    async getValidToken(): Promise<string> {
      const now = Date.now();
      if (this.accessToken && this.tokenExpirationTime && now < this.tokenExpirationTime - 120000) {
        const cachedToken = this.accessToken;
        if (this.isDriveAccessVerified) {
          return cachedToken;
        }
        try {
          await verifyDriveAccess(cachedToken);
          this.isDriveAccessVerified = true;
          return cachedToken;
        } catch {
          this.isDriveAccessVerified = false;
          this.accessToken = null;
          this.tokenExpirationTime = null;
        }
      }
      //console.log("No valid token found. Requesting a new one from Google Drive...");
      try {
        const token = await requestDriveAccessToken(this.profile?.email, true /* silent prompt */);
        await verifyDriveAccess(token);
        this.accessToken = token;
        this.tokenExpirationTime = Date.now() + 3600000;
        this.isDriveAccessVerified = true;
        return token;
      } catch (silentError) {
        console.warn("Échec du rafraîchissement silencieux, ouverture de la pop-up Google...", silentError);

        try {
          const token = await requestDriveAccessToken(this.profile?.email, false /* interactive prompt */);
          await verifyDriveAccess(token);
          this.accessToken = token;
          this.tokenExpirationTime = Date.now() + 3600000;
          this.isDriveAccessVerified = true;
          return token;
        } catch (error) {
          this.accessToken = null;
          this.tokenExpirationTime = null;
          this.isDriveAccessVerified = false;
          throw error;
        }
      }
    },

    async signOut() {
      this.isSignedIn = false;
      this.isDriveAccessVerified = false;
      this.accessToken = null;
      this.tokenExpirationTime = null;
      this.profile = null;
      useHistoryStore().clearLocalHistory();
      this.lastMessage = 'Signed out from Google.';
    },

    async saveToGoogle() {
      if (!isGoogleSyncAvailable()) {
        this.lastMessage = 'Google sync is not configured.';
        return;
      }

      const settingsStore = useSettingsStore();
      const randomizerStore = useRandomizerStore();
      const i18nStore = usei18nStore();

      this.isLoading = true;
      try {
        // 1. On récupère le token (réutilisé ou demandé une seule fois)
        const token = await this.getValidToken();
        const payload: GoogleBackupPayload = {
          version: 1,
          savedAt: new Date().toISOString(),
          data: {
            settingsStore: JSON.parse(JSON.stringify(settingsStore.$state)),
            randomizerSettings: JSON.parse(JSON.stringify(randomizerStore.settings)),
            language: i18nStore.language,
          },
        };
        // 2. On passe le token à la fonction utilitaire
        await saveConfigToGoogle(token, payload);
        this.lastMessage = 'Configuration saved to Google Drive.';
      } catch (error) {
        this.isDriveAccessVerified = false;
        const message = error instanceof Error ? error.message : 'Unable to save configuration.';
        if (/401|403|invalid token|token expired|unauthorized/i.test(message)) {
          this.accessToken = null;
        }
        this.lastMessage = message;
      } finally {
        this.isLoading = false;
      }
    },

    async restoreFromGoogle() {
      if (!isGoogleSyncAvailable()) {
        this.lastMessage = 'Google sync is not configured.';
        return;
      }

      this.isLoading = true;
      try {
        const token = await this.getValidToken();
        // 2. On passe le token à la fonction utilitaire
        const payload = await restoreConfigFromGoogle(token);
        if (!payload) {
          this.lastMessage = 'No saved configuration was found in Google Drive.';
          return;
        }
        //console.log("Restoring configuration from Google Drive:", payload);
        const settingsStore = useSettingsStore();
        const randomizerStore = useRandomizerStore();
        const i18nStore = usei18nStore();

        if (payload.data.settingsStore) {
          const rawSettings = payload.data.settingsStore;
          const cleanJsonSettings = JSON.parse(JSON.stringify(rawSettings));
          settingsStore.$patch(cleanJsonSettings);
        }

        if (payload.data.language) {
          i18nStore.UPDATE_LANGUAGE(getLanguage(payload.data.language));
        }
        this.lastMessage = 'Configuration restored from Google Drive.';
      } catch (error) {
        this.isDriveAccessVerified = false;
        const message = error instanceof Error ? error.message : 'Unable to restore configuration.';
        if (/401|403|invalid token|token expired|unauthorized/i.test(message)) {
          this.accessToken = null;
        }
        this.lastMessage = message;
      } finally {
        this.isLoading = false;
      }
    },

  },
});