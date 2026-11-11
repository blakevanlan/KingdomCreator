<template>
  <div class="rulebook">
    <a class="rulebook__cover" target="_rulebookDominion" :href="latestRulebookUrl" @click.prevent="openRulebook">
      <img class="rulebook__img" :src="imageUrl" />
      <TextOverlay>
        <span class="rulebook__overlay" :class="rulebook.id">
          {{ rulebook.name }}
        </span>
      </TextOverlay>
    </a>
    <div v-if="rulebookVersions.versions.length" class="rulebook__versions">
      <span
        v-if="rulebookVersions.language !== lang"
        class="rulebook__version-language"
        :aria-label="`Rulebook language: ${rulebookVersions.language}`"
      >
        {{ rulebookVersions.language.toUpperCase() }}
      </span>
      <a
        v-for="version in rulebookVersions.versions"
        :key="`${rulebookVersions.language}-${version.year}`"
        class="rulebook__version"
        :href="version.url"
        target="_blank"
        rel="noopener noreferrer"
        :aria-label="`${rulebook.name} - ${version.year} (${rulebookVersions.language})`"
      >
        {{ version.year }}
      </a>
    </div>
  </div>
</template>

<script lang="ts">
/* import Vue, typescript */
import { defineComponent, computed } from 'vue';

/* import Dominion Objects and type*/
import { getSetImageUrl, getRulebookUrl } from '@/utils/resources';
import { getRulebookVersions } from '@/dominion/rulebook-versions';

/* import store  */
import { usei18nStore } from '@/pinia/i18n-store';

/* import Components */
import TextOverlay from '../TextOverlay.vue';

export interface RulebookInterface {
  id: string;
  name: string;
}

export default defineComponent({
  name: "Rulebook",
  components: {
    TextOverlay,
  },
  props: {
    rulebook: { type: Object as () => RulebookInterface,
                required: true,
    },
  },
  setup(props) {
    const i18nStore = usei18nStore();
    const lang = computed(() => {return i18nStore.language});
    const imageUrl = computed(() => {
      return getSetImageUrl(props.rulebook.id, lang.value);
    });

    const rulebookVersions = computed(() =>
      getRulebookVersions(props.rulebook.id, lang.value)
    );

    const latestRulebookUrl = computed(() => {
      const versions = rulebookVersions.value.versions;
      return versions[versions.length - 1]?.url
        ?? getRulebookUrl(props.rulebook.id, lang.value);
    });

    const openRulebook = () => {
      const newWindow = window.open('', props.rulebook.name);
      if (newWindow) {
        newWindow.document.title = props.rulebook.name;
        const iframe = newWindow.document.createElement('iframe');
        iframe.src = latestRulebookUrl.value;
        iframe.style.width = '100%';
        iframe.style.height = '100vh';
        iframe.style.border = 'none';
        iframe.style.display = 'block';

        newWindow.document.body.style.margin = '0';
        newWindow.document.body.appendChild(iframe);
      }
    };

    return {
      lang,
      imageUrl,
      rulebookVersions,
      latestRulebookUrl,
      openRulebook,
    };
  }
});
</script>

 <style scoped>
.rulebook {
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  pointer-events: all;
  position: absolute;
  top: 0;
  text-decoration: none;
  width: 100%;
}
.rulebook__cover {
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
  position: absolute;
  top: 0;
  width: 100%;
}
.rulebook__img {
  height: 100%;
  pointer-events: all;
  position: absolute;
  top: 0;
  width: 100%;
  object-fit: contain;
}
.rulebook__versions {
  align-items: center;
  bottom: 2%;
  display: flex;
  flex-wrap: wrap;
  gap: 0.15em 0.45em;
  justify-content: center;
  position: absolute;
  width: 96%;
  z-index: 3;
}
.rulebook__version {
  color: #fff;
  font-size: clamp(0.75rem, 1.6vw, 1.35rem);
  font-weight: 700;
  line-height: 1.1;
  text-decoration: none;
  text-shadow: 0 1px 3px #000, 1px 1px 3px #000;
}
.rulebook__version-language {
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
  text-shadow: 0 1px 3px #000, 1px 1px 3px #000;
}
.rulebook__version:hover,
.rulebook__version:focus-visible {
  color: #ffc928;
  text-decoration: underline;
}
.rulebook__overlay {
  font-size: 15px;
  text-decoration: none;
}

@media (max-width: 600px) {
  .rulebook__overlay {
    font-size: 12px;
  }
}  
</style>