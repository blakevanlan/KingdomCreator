import { Kingdom } from '@/randomizer/kingdom';
import  { serializeKingdom } from "@/randomizer/serializer"
import type { Settings } from '@/settings/settings';
import type { SettingsState } from '@/pinia/settings-store';

const SESSION_ID_STORAGE_KEY = 'analytics-session-id';
const LAST_EVENT_SIGNATURE_STORAGE_KEY = 'analytics-last-event-signature';

function getClientContext(): { browser: string; device: string } {
  const userAgent = navigator.userAgent;
  const browser = /Edg\//.test(userAgent)
    ? 'Edge'
    : /OPR\/|Opera/.test(userAgent)
      ? 'Opera'
      : /SamsungBrowser\//.test(userAgent)
        ? 'Samsung Internet'
        : /Firefox\//.test(userAgent)
          ? 'Firefox'
          : /(?:Chrome|CriOS)\//.test(userAgent)
            ? 'Chrome'
            : /Safari\//.test(userAgent)
              ? 'Safari'
              : 'Autre';
  const isTablet = /iPad|Tablet|PlayBook|Silk/.test(userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const device = isTablet
    ? 'tablet'
    : /Mobi|Android/.test(userAgent)
      ? 'mobile'
      : 'desktop';

  return { browser, device };
}

const clientContext = getClientContext();

function getSessionId(): string {
  try {
    const storedSessionId = sessionStorage.getItem(SESSION_ID_STORAGE_KEY);
    if (storedSessionId) return storedSessionId;

    const sessionId = crypto.randomUUID();
    sessionStorage.setItem(SESSION_ID_STORAGE_KEY, sessionId);
    return sessionId;
  } catch {
    return crypto.randomUUID();
  }
}

const sessionId = getSessionId();
let hasWarnedAboutSessionStorage = false;

function warnSessionStorageUnavailable(error: unknown): void {
  if (hasWarnedAboutSessionStorage) return;
  hasWarnedAboutSessionStorage = true;
  console.warn('Analytics duplicate protection could not persist in this tab.', error);
}

function getLastEventSignature(): string | null {
  try {
    return sessionStorage.getItem(LAST_EVENT_SIGNATURE_STORAGE_KEY);
  } catch (error) {
    warnSessionStorageUnavailable(error);
    return null;
  }
}

function persistLastEventSignature(signature: string): void {
  try {
    sessionStorage.setItem(LAST_EVENT_SIGNATURE_STORAGE_KEY, signature);
  } catch (error) {
    warnSessionStorageUnavailable(error);
  }
}

let lastEventSignature = getLastEventSignature();

function normalizeForEventComparison(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(normalizeForEventComparison);
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nestedValue]) => [key, normalizeForEventComparison(nestedValue)])
    );
  }
  return value;
}

export enum EventType {
  LOAD_INITIAL_KINGDOM = "LOAD_INITIAL_KINGDOM",
  LOAD_FULL_KINGDOM_FROM_URL = "LOAD_FULL_KINGDOM_FROM_URL",
  LOAD_PARTIAL_KINGDOM_FROM_URL = "LOAD_PARTIAL_KINGDOM_FROM_URL",
  RANDOMIZE_EVENTS_AND_LANDMARKS = "RANDOMIZE_EVENTS_AND_LANDMARKS",
  RANDOMIZE_ALLY = "RANDOMIZE_ALLY",
  RANDOMIZE_PROPHECY = "RANDOMIZE_PROPHECY",
  RANDOMIZE_BOONS = "RANDOMIZE_BOONS",
  RANDOMIZE_KINGDOM = "RANDOMIZE_KINGDOM",
  RANDOMIZE_MULTIPLE_SUPPLY = "RANDOMIZE_MULTIPLE_SUPPLY",
  RANDOMIZE_SINGLE = "RANDOMIZE_SINGLE",
  RANDOMIZE_FULL_KINGDOM = "RANDOMIZE_FULL_KINGDOM",
  LOAD_INITIAL_RANDOMIZE= "LOAD_INITIAL_RANDOMIZE",
  RANDOMIZE = "RANDOMIZE",
  UPDATE_KINGDOM = "UPDATE_KINGDOM",
  KINGDOM_ACTIVITY = "KINGDOM_ACTIVITY",
  PAGE_VIEW = "PAGE_VIEW",
  BOXE_VIEW = "BOXE_VIEW",
  SET_VIEW = "SET_VIEW",
  RANDOMIZER_VIEW = "RANDOMIZER_VIEW",
  RULEBOOK_VIEW = "RULEBOOK_VIEW",
  SEARCH_CARDS_VIEW = "SEARCH_CARDS_VIEW",
  CARDS_VIEW = "CARDS_VIEW",
  SETTINGS_VIEW = "SETTINGS_VIEW",
  HELP_VIEW = "HELP_VIEW",
  HISTORY_VIEW = "HISTORY_VIEW",
  NEWS_MODAL_OPEN = "NEWS_MODAL_OPEN",
  MARK_KINGDOM_PLAYED = "MARK_KINGDOM_PLAYED",
  HISTORY_KINGDOM_REPLAY = "HISTORY_KINGDOM_REPLAY",
}

export enum Category {
  ERROR = "error",
  EVENT = "event",
}

export function getRandomizationTrackingData(
  settings: Settings,
  applicationSettings: SettingsState,
  googleDriveConnected: boolean
): Record<string, unknown> {
  const selectedSets = [...settings.selectedSets];
  const adjustedElements: string[] = [];
  if (applicationSettings.isUsingCustomDesksize) adjustedElements.push('customDeskSize');
  if (applicationSettings.useConstraintOnRandomization) adjustedElements.push('randomizationConstraints');

  const activeSetConstraints = applicationSettings.useConstraintOnRandomization
    ? Object.fromEntries(selectedSets.flatMap(setId => {
        const constraints = applicationSettings.setConstraints[setId];
        return constraints?.isSelected
          ? [[setId, {
              isSelected: constraints.isSelected,
              minCards: constraints.minCards,
              maxCards: constraints.maxCards,
              excludedCards: [...constraints.excludedCards],
            }]]
          : [];
      }))
    : {};

  return {
    selectedSets,
    configurationAdjusted: adjustedElements.length > 0,
    configurationSimplified: applicationSettings.isUsingOnlyOwnedsets,
    googleDriveConnected,
    adjustedElements,
    randomizerSettings: { ...settings.randomizerSettings },
    applicationSettings: {
      isUsingCustomDesksize: applicationSettings.isUsingCustomDesksize,
      ...(applicationSettings.isUsingCustomDesksize && {
        KingdomNb: applicationSettings.KingdomNb,
        AddonsNb: applicationSettings.AddonsNb,
        forceAddonsUse: applicationSettings.forceAddonsUse,
        addonMax: { ...applicationSettings.addonMax },
      }),
      useConstraintOnRandomization: applicationSettings.useConstraintOnRandomization,
      setConstraints: activeSetConstraints,
      isUsingOnlyOwnedsets: applicationSettings.isUsingOnlyOwnedsets,
    },
  };
}

export class EventTracker {
  static trackEvent(eventType: EventType, kingdomOrData?: Kingdom | Record<string, unknown>) {
    //console.log(new Date().toLocaleTimeString(), "EventTracker.trackEvent", eventType, kingdomOrData)
    const eventData = kingdomOrData instanceof Kingdom
      ? serializeKingdom(kingdomOrData)
      : kingdomOrData ?? {};
    EventTracker.attemptToSend(Category.EVENT, eventType, eventData);
  }

  static trackError(errorType: EventType, additionalData: Record<string, unknown> = {}) {
    EventTracker.attemptToSend(Category.ERROR, errorType, additionalData);
  }

  static trackKingdomActivity(
    kingdom: Kingdom,
    source: string,
    configuration: Record<string, unknown>
  ) {
    const ids = (cards: Array<{ id: string }> | null | undefined) =>
      (cards ?? []).map(card => card.id);

    EventTracker.attemptToSend(Category.EVENT, EventType.KINGDOM_ACTIVITY, {
      source,
      kingdom: {
        supply: ids(kingdom.supply.supplyCards),
        events: ids(kingdom.events),
        landmarks: ids(kingdom.landmarks),
        projects: ids(kingdom.projects),
        ways: ids(kingdom.ways),
        boons: ids(kingdom.boons),
        ally: kingdom.ally?.id ?? null,
        prophecy: kingdom.prophecy?.id ?? null,
        traits: ids(kingdom.traits),
        specialSupply: {
          bane: kingdom.supply.baneCard?.id ?? null,
          ferryman: kingdom.supply.ferrymanCard?.id ?? null,
          obelisk: kingdom.supply.obeliskCard?.id ?? null,
          mouseWay: kingdom.supply.mouseWay?.id ?? null,
          riverboat: kingdom.supply.riverboatCard?.id ?? null,
          approachingArmy: kingdom.supply.approachingArmyCard?.id ?? null,
          traits: ids(kingdom.supply.traitsSupply),
        },
        metadata: kingdom.metadata,
      },
      configuration,
    });
  }

  private static attemptToSend(
    category: Category,
    eventType: EventType,
    additionalData: Record<string, unknown> = {}
  ) {
    //if (!import.meta.env.PROD) return;
    EventTracker.walkstep(category, eventType, additionalData);
  }

  private static walkstep(
    type: Category,
    query: EventType,
    additionalData: Record<string, unknown> = {}
  ) {
    const endpoint = `https://suivi.71yeti.fr/server.php?source=${encodeURIComponent(window.location.hostname)}`;
    const data = {
      sessionId,
      eventOrError: type,
      eventType: query,
      clientContext,
      params: additionalData,
    };

    const signature = JSON.stringify(normalizeForEventComparison(data));
    if (signature === lastEventSignature) return;
    lastEventSignature = signature;
    persistLastEventSignature(signature);

    const body = JSON.stringify(data);
    void fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body,
      keepalive: true,
    }).then(response => {
      if (!response.ok) {
        return response.text().then(responseBody => {
          console.error(
            `Analytics request failed (${response.status} ${response.statusText})`,
            responseBody
          );
        });
      }
    }).catch(error => {
      console.error(
        `Analytics request could not reach ${endpoint}; check the browser's Network and CORS errors`,
        error
      );
    });
  }
}
