<template>
  <template v-if="block.type === 'separator'">
    <div class="card-text-line separator-line"
      style="height: 0.16em; margin: 0.4em 0px 0.24em; background-color: black;">
    </div>
  </template>
  <template v-else-if="block.type === 'bold'">
    <span class="card-text-block bold " :class="leftRightMargin"
      style="font-weight: bold; font-family: 'Times New Roman';">
      {{ block.inner }}
    </span>
  </template>
  <template v-else-if="block.type === 'verybold'">
    <span class="card-text-block bold " :class="leftRightMargin"
      style="font-size:1.3em; font-weight: bold; font-family: 'Times New Roman';">
      {{ block.inner }}
    </span>
  </template>
  <template v-else-if="block.type === 'italics'">
    <span class="card-text-block italics" :class="leftRightMargin"
      style="font-style: italic ; font-family: 'Times New Roman';">
      {{ block.inner }}
    </span>
  </template>
  <template v-else-if="block.type === 'bold_italics'">
    <span class="card-text-block bold_italics" :class="leftRightMargin"
      style="font-style: italic ; font-weight: bold; font-family: 'Times New Roman';">
      {{ block.inner }}
    </span>
  </template>
  <template v-else-if="block.type === 'bigsun_singleline'">
    <div class="card-text-line sun " :style="BigStyle">
      <span class="card-text-block no-left-margin">+1 </span>
      <span class="sun-icon"></span>
    </div>
  </template>
  <template v-else-if="block.type === 'shield' || block.type === 'bigshield'">
    <span class="card-text-block shield" :style="BigStyle">
      <span class="victory-container">
        <span class="victory-amount" :style="shieldTextoffset">{{ block.inner }}</span>
        <span class="victory-shield"></span>
      </span>
    </span>
  </template>
  <template v-else-if="block.type.includes('bigcoin_singleline')">
    <div class="card-text-line bigcoin_singleline" :style="BigStyle">
      <span v-if="!(block.type === 'bigcoin_singleline_noPlus')" class="card-text-block no-left-margin no-right-margin">+</span>
      <span class="card-text-block">
        <span class="cost-container">
          <span v-if="block.inner === 'P'" class="potion-cost"></span>
          <span v-else-if="block.inner.includes('D')" class="debt-cost">{{ extractNumber(block.inner)}}</span>
          <span v-else class="coin-cost">{{ block.inner }}</span>
        </span>
      </span>
    </div>
  </template>
  <template v-else-if="block.type === 'coin' || block.type === 'bigcoin'">
    <span class="card-text-block coin" :class="leftRightMargin" :style="BigStyle">
      <span class="cost-container">
        <span v-if="block.inner === 'P'" class="potion-cost"></span>
        <span v-else-if="block.inner.includes('D')" class="debt-cost">{{ extractNumber(block.inner) }}</span>
        <span v-else class="coin-cost">{{ block.inner }}</span>
      </span>
    </span>
  </template>
  <template v-else-if="block.type === 'sun'">
    <span class="sun-icon"></span>
  </template>

  <template v-else-if="block.type === 'bigshield_singleline'">
    <div class="card-text-line bigshield_singleline" :style="BigStyle">
      <span class="card-text-block no-left-margin no-right-margin">+</span>
      <span class="card-text-block">
        <span class="victory-container">
          <span class="victory-amount" :style="shieldTextoffset">{{ block.inner }}</span>
          <span class="victory-shield"></span>
        </span>
      </span>
    </div>
  </template>
  <template v-else>
    <span class="card-text-block normal" :class="leftRightMargin">{{ block.inner }}</span>
  </template>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'CardTextBlock',
  props: {
    cardId: {
      type: String,
      required: true,
    },
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
      if (props.block.type.startsWith('big')) {
        if (props.block.type == 'bigshield_singleline')
          return  { fontSize: '1.45em',
                fontWeight: 'bold'};
        else if (props.block.type == 'bigcoin_singleline_noPlus' )
          return  { fontSize: '1.6em',
                    fontWeight: 'bold'};
        else if (props.block.type.includes('coin') || props.block.type.includes('sun'))
          return  { fontSize: '1.3em',
                    fontWeight: 'bold'};
        else if (props.block.type.includes('shield'))
          return  { fontSize: '3em',
                    fontWeight: 'bold'};
      }
      return null;
    });

    const shieldTextoffset = computed(() => {
      if (props.block.type.startsWith('big')) { // 0 1 2
        if (props.block.inner == '0') return { marginTop: '-0.1em' }; // darkages
        if (props.cardId =='crumblingcastle'  ||// empires
            props.cardId == 'smallcastle' ||
            props .cardId == 'opulentcastle'  ||
            props.cardId == 'sprawlingcastle' ||
            props.cardId == 'grandcastle' ) return { marginTop: '-0.1em' }; 

      } else { // not 'big'
        if (props.cardId == 'kingscastle') return null;
        if (props.block.inner == '0') return { marginTop: '-0.1em' }; 
        if (props.block.inner == '2') return { marginTop: '-0.1em' }; 
        if (props.block.inner == '4') return { marginTop: '-0.1em' }; 
        if (props.block.inner == '1')  return { marginTop: '-0.1em' };
      }
      return null;
    });

    const getpreviousBlockType = (index: number) => {
      if (index === 0)
        return '';
      return props.blocks[index - 1]!.type;
    };

    const getnextBlockType = (index: number) => {
      if (index === props.blocks.length - 1)
        return '';
      return props.blocks[index + 1]!.type;
    };

    const leftRightMargin = computed(() => {
      let leftMargin =1;
      let rightMargin =1;
      if (props.blockIndex === 0 && props.blocks.length ===  1) leftMargin = rightMargin = 1

      if (getnextBlockType(props.blockIndex) === 'coin') {
        rightMargin=0
        if (props.blocks[props.blockIndex + 1]!.inner === 'P' 
            || props.blocks[props.blockIndex + 1]!.inner.startsWith('D')) rightMargin = 1
      }
      if (getpreviousBlockType(props.blockIndex) === 'coin' ) leftMargin = 0
      if ((getpreviousBlockType(props.blockIndex) === 'italics' 
          || getpreviousBlockType(props.blockIndex) === 'bold' 
          || getpreviousBlockType(props.blockIndex) === 'bold_italics')
          && (props.block.inner.startsWith('.') 
              ||props.block.inner.startsWith(','))) leftMargin = 0;
      if (props.block.type === 'coin') {
        leftMargin = rightMargin = 0
        if (props.block.inner === 'P' || props.block.inner.startsWith('D')) leftMargin = rightMargin = 1
      }
      if (props.block.type === 'italics') rightMargin = 0
      if (props.block.type === 'bold_italics') {
        if (props.blockIndex == props.blocks.length - 1) rightMargin = 1
        else {
          if (props.blocks[props.blockIndex + 1]!.inner.startsWith('.') || props.blocks[props.blockIndex + 1]!.inner.startsWith(',')) rightMargin = 0
        }
      } 

      if (props.blockIndex === 0 ) leftMargin = 1
      if (props.blockIndex === props.blocks.length -1 ) rightMargin = 1

      if (leftMargin === 0 && rightMargin ===0) return 'no-left-margin no-right-margin'; 
      if (leftMargin ===0) return 'no-left-margin';
      if (rightMargin ===0) return 'no-right-margin';
      return '';

    });

    const extractNumber = (str: string) => {
      const match = str.match(/(\d+)/);
      return match ? match[1] : "";
    };

    return {
      BigStyle,
      leftRightMargin,
      shieldTextoffset,
      extractNumber
    };
  },
  
});
</script>
