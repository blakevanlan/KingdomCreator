<template>
  <template v-if="isEmptyLine"> 
    <div class="card-text-line" style="height: 0.4em;"></div>
  </template> 
  <template v-else-if="hasOnlySeparator"> 
    <div class="card-text-line separator-line" style="height: 0.16em; margin: 0.4em 0px 0.24em; background-color: black;"
    ></div>
  </template>
  <template v-else-if="isSingleLine">
    <CardTextBlock :cardId="cardId" :block="blocks[0]" :blockIndex="0" :blocks="blocks"/>
  </template> 
  <template v-else> 
    <div class="card-text-line" :style="singleBoldStyle">
      <template v-for="(block, index) in blocks" :key="index">
        <CardTextBlock :cardId="cardId" :block="block" :blockIndex="index" :blocks="blocks"/>
      </template>
    </div>
  </template>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import CardTextBlock from './CardTextBlock.vue';

export default defineComponent({
  name: 'CardTextLine',
  components: {
    CardTextBlock,
  },
  props: {
    cardId: {
      type: String,
      required: true,
    },
    line: {
      type: String,
      required: true,
    },
    getBlocks: {
      type: Function,
      required: true,
    },
  },
  setup(props) {
    const blocks = computed(() => props.getBlocks(props.line));
    const isEmptyLine = computed(() => props.line.trim() === '');
    const hasOnlySeparator = computed(() => blocks.value.length === 1 && blocks.value[0].type === 'separator' );
    const isSingleLine = computed(() => {
      return (blocks.value.length === 1 && 
                (blocks.value[0].type === 'bigshield_singleline' || 
                 blocks.value[0].type === 'bigcoin_singleline'   ||
                 blocks.value[0].type === 'bigcoin_singleline_noPlus' ))
    });

    // Vérifie si une ligne contient un seul bloc de type bold
    const singleBoldStyle = computed(() => {
      if (blocks.value.length === 1 && 
            (blocks.value[0].type === 'bold' || blocks.value[0].type === 'verybold'))
        return { fontSize: '1.3em' };
      if (blocks.value.length === 1 && blocks.value[0].type === 'bigcoin') return { fontSize: '2em' };
      return null;
    });

    return {
      blocks,
      isEmptyLine,
      isSingleLine,
      hasOnlySeparator,
      singleBoldStyle
    };
  },
});
</script>
