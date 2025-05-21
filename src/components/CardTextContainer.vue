<template>
  <div :class="layoutClass">
    <div ref="container" class="card-text-container" :class="cardTextBoxSize" 
      :style="computedStyle" style="font-family: 'Times New Roman';">
      <CardTextLine :cardId="card.id"
        v-for="(line, index) in lines"
        :key="index"
        :line="line"
        :getBlocks="getBlocks"
      />
    </div>
  </div>
</template>
  
<script lang="ts">
import { defineComponent, computed } from 'vue';
import { ref, onMounted, nextTick, watch } from "vue";

import CardTextLine from './CardTextLine.vue';
import type { DigitalCard } from "../dominion/digital_cards/digital-cards-type.ts";
import { FrenchCardTexts } from "../dominion/digital_cards/Dominion.games.ts";
import { DominionSets } from '../dominion/dominion-sets.ts';

interface Block {
  type: string;
  inner: string;
};

export default defineComponent({
  name: 'CardTextContainer',
  components: {
    CardTextLine,
  },
  props: {
    direction: {
      type: String,
      required:true
    },
    card: {
      type: Object as () => DigitalCard,
      required: true,
    },
  },
  setup(props) {
      const layoutClass = computed(()=> {
        if (props.direction == "portrait")
         return `full-card-text-container card-stack-layer text-layer`;
        if (props.direction == "landscape")
          return `landscape-text-container`
        return `landscape-text-container`
      })

    const cardTextBoxSize = computed(() => {
        if (props.direction == "portrait")
          return "portaitCard"
        if (props.direction == "landscape")
          return `landscapeCard`
        return 'notset'
    })

    const lines = computed(() => { 
      return (FrenchCardTexts[props.card.id.toUpperCase()] || '').split('//') 
    });

    const regextests = [
      { regex: /^(---)/, type: 'separator' },
      { regex: /^\|\+\[(.*?)\]\|/, type: 'bigcoin_singleline' }, // Cas particulier
      { regex: /^\|\[!(.*?)\]\|/, type: 'bigcoin_singleline_noPlus' }, // Cas particulier
      { regex: /^\|\+{(.*?)}\|/, type: 'bigshield_singleline' }, // Cas particulier
      { regex: /^\|\+(.*?) <>\|/, type: 'bigsun_singleline' }, // Cas particulier

      { regex: /^([^><\[{\|%]+)/, type: 'normal' },
      { regex: /^\|%(.*?)%\|/, type: 'bold_italics' },
      { regex: /^%\|(.*?)\|%/, type: 'bold_italics' },
      { regex: /^\|\|(.*?)\|\|/, type: 'verybold' },
      { regex: /^\|(.*?)\|/, type: 'bold' },
      { regex: /^%(.*?)%/, type: 'italics' },
      { regex: /^\[!(.*?)\]/, type: 'bigcoin' },
      { regex: /^\[(.*?)\]/, type: 'coin' },
      { regex: /^{!(.*?)}/, type: 'bigshield' },
      { regex: /^{(.*?)}/, type: 'shield' },
      { regex: /^<>/, type: "sun" },
    ];

    const getBlocks = (line: string) => {
      let text = line;
      const blocks: Block[] = [];
      while (text.length > 0) {
        let matched = false;
        for (const test of regextests) {
          const match = text.match(test.regex);
          if (match) {
            blocks.push({ type: test.type, inner: match[1] });
            text = text.slice(match[0].length);
            matched = true;
            break;
          }
        }
        if (!matched) break;
      }
      return blocks;
    };

  const container = ref<HTMLElement | null>(null);
const fontSize = ref(24); // Taille initiale =  taille maxilmale
const minFontSize = 10;
const step = 0.1;

// Style calculé pour appliquer dynamiquement la police
const computedStyle = computed(() => ({
  fontSize: `${fontSize.value}px`,
  lineHeight: `${fontSize.value * 1.2}px`,
}));

  // Fonction pour ajuster la taille de police après rendu complet
const adjustFontSize =  async () => {
  console.log("🛠️ adjustFontSize called");
      await nextTick();
      if (!container.value) {
        console.warn("⚠️ adjustFontSize aborted: container is null");
        return;
      }
  console.log(container.value.innerText)

  console.log("carry on  adjust fontsize")

  let size = fontSize.value;
  container.value.style.fontSize = `${size}px`;

  while (isOverflowing() && size > minFontSize) {
    size -= step;
    container.value.style.fontSize = `${size}px`;
    container.value.style.lineHeight = `${size * 1.2}px`;
  }
  fontSize.value = size; // Mise à jour de la police
};

// Vérifie si le texte déborde du conteneur
const isOverflowing = () => {
  if (!container.value) return false;
  console.log('isOF', container.value.scrollHeight, container.value.scrollWidth, container.value.clientHeight, container.value.clientWidth)
  return (
    container.value.scrollHeight > container.value.clientHeight ||
    container.value.scrollWidth > container.value.clientWidth*1.01
  );
};

// Observer les changements de contenu et de taille
const observeChanges = () => {
  console.log("in observeChanges")
  if (!container.value) return;
  console.log("carry on observeChanges")

  const mutationObserver = new MutationObserver(adjustFontSize);
  mutationObserver.observe(container.value, { childList: true, subtree: true });

  const resizeObserver = new ResizeObserver(adjustFontSize);
  resizeObserver.observe(container.value);
};

onMounted(async () => {
  await nextTick();
  setTimeout(() => {
    if (container.value) {
      adjustFontSize();
      observeChanges();
    }
  }, 50);

});

// Surveiller les changements de `lines`
    watch(
      () => lines.value, // ✅ Correction : s'assurer que Vue détecte bien la réactivité
      () => {
        console.log("📝 Lines updated, adjusting font size...");
        adjustFontSize();
      },
      { deep: true }
    );

    watch(container, (newVal) => {
      if (newVal) {
        console.log("🆕 Container updated, adjusting font size...");
        console.log(newVal.innerText)
        adjustFontSize();
      }
    });

    return {
      layoutClass,
      lines,
      getBlocks,
      computedStyle,
      container,
      cardTextBoxSize
    };
  },
});
</script>

