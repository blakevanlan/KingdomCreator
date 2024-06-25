/* import Vue, typescript */
import { computed, watch } from "vue";
import type { I18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";

/* import Dominion Objects and type*/
/* import store  */
import { usei18nStore } from "../pinia/i18n-store";
import { Language, getLanguage } from "../i18n/language";
import { i18n, getLocale } from "../i18n/i18n";

/* import Components */
  const useBase = () => {
  const i18nStore = usei18nStore();
  const route = useRoute();
  const router = useRouter();

  const languageStateStr = computed(() => getLocale(i18n as I18n));
  const routeQueryLang = computed(() => route.query.lang);

  // functions for onBeforeMount 
  // placed her to avoid: Cannot access 'loadLanguageForQueryParam' before initialization
  const loadLanguageForQueryParam = () => {
    const langStr = Array.isArray(route.query.lang)
      ? route.query.lang[0]
      : route.query.lang;
    if (langStr && typeof langStr === 'string' && langStr !== languageStateStr.value) {
      i18nStore.UPDATE_LANGUAGE(getLanguage(langStr) as Language);
    }
  };

  // for Watch function : languageStateStr
  const onLanguageChanged = () => {
    if (route.query.lang === languageStateStr.value) { return; }
    if (getLanguage(languageStateStr.value) === Language.ENGLISH) {
      if (! route.query.lang) { 
        return; }
      const { lang, ...query } = route.query;
      router.replace({ query });
    } else {
      router.replace({
        query: {
          ...route.query,
          lang: languageStateStr.value,
        },
      });
    }
  };

  // for Watch function : $route.query.lang
  const onLanguageQueryParameterChanged = () => {
    if (route.query.lang !== languageStateStr.value) {
      i18nStore.UPDATE_LANGUAGE(route.query.lang as Language);
    }
  };

  if (route.query.lang) {
    loadLanguageForQueryParam();
  } else {
    i18nStore.UPDATE_LANGUAGE(i18nStore.language);
    onLanguageChanged();
  }

  watch(languageStateStr, onLanguageChanged);
  watch(routeQueryLang, onLanguageQueryParameterChanged);

  return {
    languageStateStr,
    routeQueryLang,
    onLanguageChanged,
    onLanguageQueryParameterChanged,
  };
}

export default useBase
