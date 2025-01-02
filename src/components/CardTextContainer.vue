<template>
  <div class="full-card-text-container card-stack-layer text-layer">
    <div class="card-text-container" :style="FontSize" style="font-family: 'Times New Roman';">
      <CardTextLine
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
import CardTextLine from './CardTextLine.vue';
import type { DigitalCard } from "../dominion/digital_cards/digital-cards-type";
import { FrenchCardTexts } from "../dominion/digital_cards/french/Dominion.games.ts";
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
    card: {
      type: Object as () => DigitalCard,
      required: true,
    },
  },
  setup(props) {
    const cardText = computed(() => FrenchCardTexts[props.card.id.toUpperCase()] || '');
    const lines = computed(() => cardText.value.split('//'));

    const regextests = [
      { regex: /^(---)/, type: 'separator' },
      { regex: /^\|\+\[(.*?)\]\|/, type: 'bigcoin_singleline' }, // Cas particulier
      { regex: /^([^\[{\|%]+)/, type: 'normal' },
      { regex: /^\|(.*?)\|/, type: 'bold' },
      { regex: /^%(.*?)%/, type: 'italics' },
      { regex: /^\[!(.*?)\]/, type: 'bigcoin' },
      { regex: /^\[(.*?)\]/, type: 'coin' },
      { regex: /^{!(.*?)}/, type: 'bigshield' },
      { regex: /^{(.*?)}/, type: 'shield' },
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

// To calculate the font size of the card text

//constant
    const cardName = { isLandscape: DominionSets.isLandscape(props.card.id), hasHeirloom: false };
    const CardSizes = { FULL: { portraitRatio : 1.5777777777777777, landscapeRatio : 0.6338028169014085 } };
    const factors = { boldLineFactor : 1.3,
                      bigLineFactor : 2, 
                      separatorFactor : cardName.isLandscape ? 0.4 : 0.8, 
                      blankFactor : cardName.isLandscape ? 0.2 : 0.4,
                      maxFontFactor : 0.15,
                      maxLandscapeFontFactor : 0.4,
                      heirloomFactor : 1.1 ,
                      victoryRatio : 0.9,
                      sunRatio : 1
                    }
    const { boldLineFactor, bigLineFactor, separatorFactor, blankFactor, maxFontFactor,
            maxLandscapeFontFactor, heirloomFactor, victoryRatio, sunRatio } = factors;
    const measurementCanvas = document.createElement("canvas");
    const ctx = measurementCanvas.getContext("2d");

// function for font size calculation
    const FontSize = computed(() =>  {
      let measurementSize = 50
      let totalHeight = 1;
      let longestWidth = 1;

      for(const line of lines.value) {
        const metrics = measureLine(line, "Times New Roman", measurementSize);
        longestWidth = Math.max(longestWidth, metrics.width);
        totalHeight += metrics.height;
        //console.log(props.card.id, longestWidth, totalHeight)
      };
      //console.log(props.card.id, longestWidth, totalHeight)
      const bbox = getCardTextBlockSize(340, cardName); 
      //console.log(props.card.id, bbox)
      const capSize = bbox.height * (cardName.isLandscape ? maxLandscapeFontFactor : maxFontFactor);
      const measuredSize = Math.min( measurementSize * bbox.height / totalHeight,
                measurementSize * bbox.width / longestWidth);
      //console.log(props.card.id, 340, measuredSize, capSize)



      return `font-size: ${Math.min(capSize, measuredSize).toFixed(2)}px`;
    })

    const lineHeight = computed(() => {
      const bbox = getCardTextBlockSize(340, cardName);
      return `line-height: ${bbox.height}px`;
    });

    const measureLine = (line:string, fontFamily:string, measurementSize: number) => {
      const lineIsBold = /^\|.*?\|$/.test(line);
      const lineIsHeirloom = /^%%.*?%%$/.test(line);
      const lineIsSeparator = line === "---";
      const lineIsBlank = line === "";
      const lineIsBig = /^[\[{]!.*?[\]}]$/.test(line);
      const lineText = lineIsBold || lineIsHeirloom ? line.slice(2, -2) : line;

      let adjustedSize = measurementSize;
      if (lineIsBold) adjustedSize *= boldLineFactor;
      if (lineIsBig) adjustedSize *= bigLineFactor;
      if (lineIsSeparator) adjustedSize *= separatorFactor;
      if (lineIsBlank) adjustedSize *= blankFactor;
      if (lineIsHeirloom) adjustedSize *= heirloomFactor;

      let totalLength = 0;
      let totalHeight = 0;
      if (!lineIsSeparator && !lineIsBlank) {
        const blocks = getBlocks(lineText);
        blocks.forEach((block) => {
          totalLength += measureBlock(block, fontFamily, adjustedSize).width;
          totalHeight += measureBlock(block, fontFamily, adjustedSize).height;
        });
      }
      return { width: totalLength, height: adjustedSize };
    }

    const measureBlock = (block: Block, fontFamily: string, measurementSize: number) => {     
      if (!ctx) throw new Error("Failed to get 2D context");
      let evaluatedSize
      let addition = 0;
      switch (block.type) {
        case "normal":
          ctx.font = `${measurementSize}px ${fontFamily}`;
          break
        case "italics":
          ctx.font = `italic ${measurementSize}px ${fontFamily}`;
          break
        case "bold":
          ctx.font = `bold ${measurementSize}px ${fontFamily}`;
          break
        case "coin":
        case "bigcoin":
        case "sun":
          return {width : measurementSize, height : measurementSize}
        case "shield":
          ctx.font = `bold ${measurementSize}px ${fontFamily}`;
          addition = measurementSize * victoryRatio;
          break;
        case "bigshield":
          ctx.font = `bold ${measurementSize * bigLineFactor}px ${fontFamily}`;
          addition = measurementSize * victoryRatio;
          break;
        default:
          throw new Error(`Unknown block type: ${block.type}`);
      }
      evaluatedSize = ctx.measureText(block.inner); 
      const ascent = evaluatedSize.actualBoundingBoxAscent || measurementSize * 0.8; // Valeur par défaut si non supportée
      const descent = evaluatedSize.actualBoundingBoxDescent || measurementSize * 0.2; // Valeur par défaut si non supportée

      return {width : ctx.measureText(block.inner).width + addition, height : ascent + descent};  
    }

    const getCardTextBlockSize = (w: number, cardName: { isLandscape: boolean; hasHeirloom: boolean }) => {
      const { portraitRatio, landscapeRatio } = CardSizes.FULL;
      if (cardName.isLandscape) return { height: w * landscapeRatio * 0.21, width: w * 0.815 };
      if (cardName.hasHeirloom) return { height: w * portraitRatio * 0.27, width: w * 0.795 };
      return { height: w * portraitRatio * 0.31, width: w * 0.795 };
    }

    return {
      lines,
      getBlocks,
      FontSize
    };
  },
});
</script>