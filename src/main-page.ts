import Index from './views/Index.vue';
import Sets from './views/Sets.vue';
import Rules from './views/Rules.vue';
import Boxes from './views/Boxes.vue';
import Cards from './views/Cards.vue';
import Settings from './views/Settings.vue';
import SearchCards from './views/SearchCards.vue';
import Help from './views/Help.vue';
import History from './views/History.vue';

import { initialize } from './setup';
import { AppCreateRouterMultiple } from './router';
import { EventTracker, EventType } from './analytics/follow-activity';
import { usei18nStore } from './pinia/i18n-store';
import { useSetsStore } from './pinia/sets-store';
import { getLanguage } from './i18n/language';

import '../styles/index.styl';

const router = AppCreateRouterMultiple([
                { paths: ["/index.html", "/index", "/", ""], component : Index },
                { paths: ["/sets"], component : Sets },
                { paths: ["/rulebooks"], component : Rules },
                { paths: ["/boxes"], component : Boxes },
                { paths: ["/searchCards"], component : SearchCards },
                { paths: ["/cards"], component : Cards },
                { paths: ["/settings"], component : Settings },
                { paths: ["/help"], component : Help }, 
                { paths: ["/history"], component : History }, 
                { paths: ["/:pathMatch(.*)*"], component : Index } // catch all 404
            ]);

const trackedPages: Record<string, EventType> = {
  '/': EventType.RANDOMIZER_VIEW,
  '/index': EventType.RANDOMIZER_VIEW,
  '/index.html': EventType.RANDOMIZER_VIEW,
  '/sets': EventType.SET_VIEW,
  '/rulebooks': EventType.RULEBOOK_VIEW,
  '/boxes': EventType.BOXE_VIEW,
  '/searchcards': EventType.SEARCH_CARDS_VIEW,
  '/cards': EventType.CARDS_VIEW,
  '/settings': EventType.SETTINGS_VIEW,
  '/help': EventType.HELP_VIEW,
  '/history': EventType.HISTORY_VIEW,
};

router.afterEach((to, from, failure) => {
  const pageKey = to.path.toLowerCase();
  const languageChangedOnRulesPage =
    pageKey === '/rulebooks' && to.query.lang !== from.query.lang;
  if (failure || (from.matched.length > 0 && to.path === from.path && !languageChangedOnRulesPage)) return;

  const eventType = trackedPages[pageKey];
  if (!eventType) return;

  if (eventType === EventType.BOXE_VIEW || eventType === EventType.SET_VIEW) {
    const setsStore = useSetsStore();
    const setId = eventType === EventType.SET_VIEW
      ? setsStore.selectedSetId
      : setsStore.selectedBoxesSetId;
    EventTracker.trackEvent(eventType, { setId });
    return;
  }

  const eventData: Record<string, unknown> = {};
  if (pageKey === '/rulebooks') {
    const routeLanguage = Array.isArray(to.query.lang) ? to.query.lang[0] : to.query.lang;
    eventData.language = routeLanguage
      ? getLanguage(routeLanguage)
      : usei18nStore().language;
  }
  EventTracker.trackEvent(eventType, eventData);
});

initialize(router);