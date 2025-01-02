<template>
  <template v-if="block.type === 'separator'">
    <div class="card-text-line separator-line"
      style="height: 0.16em; margin: 0.4em 0px 0.24em; background-color: black;">
    </div>
  </template>
  <template v-else-if="block.type === 'bold'">
    <span class="card-text-block"
      style="font-weight: bold; font-family: 'Times New Roman';">
      {{ block.inner }}
    </span>
  </template>
  <template v-else-if="block.type === 'shield' || block.type === 'bigshield'">
    <span class="card-text-line" :style="BigStyle">
      <span class="victory-container">
        <div class="victory-amount">{{ block.inner }}</div>
        <div class="victory-shield"></div>
      </span>
    </span>
  </template>
  <template v-else-if="block.type === 'coin' || block.type === 'bigcoin'">
    <span class="card-text-line"  :style="BigStyle">
      <span class="cost-container">
        <div class="coin-cost">{{ block.inner }}</div>
      </span>
    </span>
  </template>
  <template v-else-if="block.type === 'bigcoin_singleline'">
    <div class="card-text-line" :style="BigStyle">
      <span class="card-text-block no-left-margin no-right-margin">+</span>
      <span class="card-text-block">
        <span class="cost-container">
          <div class="coin-cost">{{ block.inner }}</div>
        </span>
      </span>
    </div>
  </template>
  <template v-else>
    <span class="card-text-block" :class="leftRightMargin">{{ block.inner }}</span>
  </template>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'CardTextBlock',
  props: {
    block: {
      type: Object as () => { type: string; inner: string },
      required: true,
    },
    blockIndex: {
      type: Number,
      required: true,
    },
    blocks: {
      type: Array as () => { type: string; inner: string }[],
      required: true,
    }
  },

  setup(props) {
    const BigStyle = computed(() => {
      if (props.block.type.startsWith('big'))
      if (props.block.type.includes('coin'))
        return  { fontSize: '1.3em',
                  fontWeight: 'bold'};
      else if (props.block.type.includes('shield'))
        return  { fontSize: '3em',
                  fontWeight: 'bold'};
      return null;
    });

    const getpreviousBlockType = (index: number) => {
      if (index === 0)
        return '';
      return props.blocks[index - 1].type;
    };
    const getnextBlockType = (index: number) => {
      if (index === props.blocks.length - 1)
        return '';
      return props.blocks[index + 1].type;
    };

    const leftRightMargin = computed(() => {
    //console.log(props.blockIndex, props.block.inner)
    if (props.blockIndex === 0 && getnextBlockType(props.blockIndex) === 'coin') return 'no-right-margin';
    // dépend du type du bloc suivant pour savoir s'il faut ajouter une marge à droite
    if (getpreviousBlockType(props.blockIndex) === 'coin' ) return 'no-left-margin no-right-margin';
    return '';
    });


    return {
      BigStyle,
      leftRightMargin
    };
  },
  
});
</script>
