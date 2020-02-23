import { State } from "vuex-class";
import { Vue, Component, Watch } from "vue-property-decorator";
import { Language, getLanguage } from "../i18n/language";
import { UPDATE_LANGUAGE, LOAD_DEFAULT_LANGUAGE } from "../stores/i18n/action-types";

@Component
export default class Base extends Vue {
  @State(state => state.i18n.language) readonly language!: Language;

  created() {
    if (this.$route.query.lang) {
      this.updateLanguageForQueryParam();    
    } else {
      this.$store.dispatch(LOAD_DEFAULT_LANGUAGE);
    }
  }

  @Watch("$route.query.lang")
  onLanguageQueryParameterChanged() {
    if (this.$route.query.lang != this.language) {
      this.$store.dispatch(UPDATE_LANGUAGE, this.$route.query.lang);
    }
  }

  @Watch("language")
  onLanguageChanged() {
    if (this.$route.query.lang == this.language) {
      return;
    }
    if (this.language == Language.ENGLISH) {
      const { lang, ...query } = this.$route.query;
      this.$router.replace({query});
    } else {
      this.$router.replace({
        query: {
          ...this.$route.query,
          lang: this.language
        }
      });
    }
  }

  updateLanguageForQueryParam() {
    const lang = this.$route.query.lang instanceof Array 
      ? this.$route.query.lang[0]!
      : this.$route.query.lang as string;
    this.$store.dispatch(UPDATE_LANGUAGE, getLanguage(lang));
  }
}
