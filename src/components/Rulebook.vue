<template>
  <a class="rulebook" target="_rulebookDominion" :href="rulebookUrl">
    <img class="rulebook__img" :src="imageUrl" />
    <TextOverlay>
      <span class="rulebook__overlay" :class="rulebook.id">
        {{ rulebook.name }}
      </span>
    </TextOverlay>
  </a>
</template>

<script lang="ts">
/* import Vue, typescript */
import { defineComponent, computed } from "vue";

/* import Dominion Objects and type*/
import { getSetImageUrl, getRulebookUrl } from "../utils/resources";

/* import store  */
import { usei18nStore } from '../pinia/i18n-store';

/* import Components */
import TextOverlay from "./TextOverlay.vue";

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

    const rulebookUrl = computed(() => {
      return getRulebookUrl(props.rulebook.id, lang.value);
    });

    return {
      imageUrl,
      rulebookUrl,
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
  text-decoration: none;
}
.rulebook,
.rulebook__img {
  height: 100%;
  pointer-events: all;
  position: absolute;
  top: 0;
  width: 100%;
  object-fit: contain;
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