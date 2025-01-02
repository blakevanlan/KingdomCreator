<template>
  <template v-if="isEmptyLine"> 
    <div class="card-text-line" style="height: 0.4em;"></div>
  </template> 
  <template v-else-if="hasOnlySeparator"> 
    <div class="card-text-line separator-line" style="height: 0.16em; margin: 0.4em 0px 0.24em; background-color: black;"
    ></div>
  </template>
  <template v-else> 
    <span class="card-text-line" :style="singleBoldStyle">
      <template v-for="(block, index) in blocks" :key="index">
        <CardTextBlock :block="block" :blockIndex="index" :blocks="blocks"/>
      </template>
    </span>
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
    const hasOnlySeparator = computed(() =>
      blocks.value.length === 1 && blocks.value[0].type === 'separator'
    );
    // Vérifie si une ligne contient un seul bloc de type bold
    const singleBoldStyle = computed(() => {
      if (blocks.value.length === 1 && blocks.value[0].type === 'bold') {
        return {
          fontSize: '1.3em',
        };
      }
      return null;
    });

    return {
      blocks,
      isEmptyLine,
      hasOnlySeparator,
      singleBoldStyle
    };
  },
});
</script>
