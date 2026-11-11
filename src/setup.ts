import { createApp } from 'vue';
import type { Router } from 'vue-router';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

import { useWindowStore } from '@/pinia/window-store';
import { useGoogleSyncStore } from '@/pinia/google-sync-store';
import { i18n } from '@/i18n/i18n';

import App from './views/App.vue';


export function initialize<S>(router: Router) {
  const app = createApp(App)
  const pinia = createPinia().use(piniaPluginPersistedstate);

  app.use(i18n);
  app.use(router);
  app.use(pinia);

  initializeWindowListener();
  const googleSyncStore = useGoogleSyncStore();
  googleSyncStore.initialize();

  app.mount('#app');
};

function initializeWindowListener () {
  window.addEventListener("resize", updateWindowSize);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) updateWindowSize();
  });
  updateWindowSize();
};

function updateWindowSize () {
  if (window.outerWidth <= 0) return;
  const WindowStore = useWindowStore();
  WindowStore.updateWindowWidth(window.outerWidth);
};
