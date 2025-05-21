<template>
  <button :aria-label="$t('copyButton')" class="copy-button" :class="{ 'copy-button--has-copied': hasCopied }" @click="handleClick()">
    <input name="copybutton" :aria-label="$t('copyButton')" ref="textInput" class="copy-button__input" type="text" :value="text" readonly />
    <div class="copy-button__icon">
      <svg height="24" width="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path
          d="M456.533 153.6H422.4v-51.2c-.028-23.553-19.114-42.639-42.667-42.667h-35.706A25.556 25.556 0 00320 42.667h-17.067V25.6c-.015-14.132-11.468-25.585-25.6-25.6h-102.4c-14.132.015-25.585 11.468-25.6 25.6v17.067h-17.067a25.559 25.559 0 00-24.028 17.067H72.533c-23.552.027-42.639 19.113-42.666 42.666v332.8c.028 23.553 19.114 42.639 42.667 42.667h102.4v8.533c.015 14.132 11.468 25.585 25.6 25.6h256c14.132-.015 25.585-11.468 25.6-25.6V179.2c-.016-14.132-11.469-25.585-25.601-25.6zM166.4 25.6a8.544 8.544 0 018.533-8.533h102.4a8.544 8.544 0 018.533 8.533v17.067H166.4V25.6zm-42.667 42.667a8.544 8.544 0 018.533-8.533H320a8.544 8.544 0 018.533 8.533V102.4a8.544 8.544 0 01-8.533 8.533H132.267a8.544 8.544 0 01-8.533-8.533V68.267zm51.2 110.933v281.6h-102.4c-14.132-.015-25.585-11.468-25.6-25.6V102.4c.015-14.132 11.468-25.585 25.6-25.6h34.133v25.6c.015 14.132 11.468 25.585 25.6 25.6H320c14.132-.015 25.585-11.468 25.6-25.6V76.8h34.133c14.132.015 25.585 11.468 25.6 25.6v51.2h-204.8c-14.132.015-25.584 11.468-25.6 25.6zm290.134 307.2a8.544 8.544 0 01-8.533 8.533h-256a8.544 8.544 0 01-8.533-8.533V179.2a8.544 8.544 0 018.533-8.533h256a8.544 8.544 0 018.533 8.533v307.2z" />
        <path
          d="M405.333 256h-153.6c-4.713 0-8.533 3.82-8.533 8.533s3.82 8.533 8.533 8.533h153.6c4.713 0 8.533-3.82 8.533-8.533s-3.82-8.533-8.533-8.533zM405.333 298.667h-153.6c-4.713 0-8.533 3.82-8.533 8.533s3.82 8.533 8.533 8.533h153.6c4.713 0 8.533-3.82 8.533-8.533s-3.82-8.533-8.533-8.533zM405.333 341.333h-153.6c-4.713 0-8.533 3.82-8.533 8.533s3.82 8.533 8.533 8.533h153.6c4.713 0 8.533-3.82 8.533-8.533s-3.82-8.533-8.533-8.533zM405.333 384h-153.6a8.533 8.533 0 000 17.066h153.6a8.533 8.533 0 000-17.066z" />
      </svg>
    </div>
    <transition name="fade-slide-in">
      <div v-if="hasCopied()" class="copy-button__copied">
        {{ $t("copied") }}
      </div>
    </transition>
  </button>
</template>

<script lang="ts">
/* import Vue, typescript */
import { defineComponent, ref } from "vue";

/* import Dominion Objects and type*/
/* import store  */
/* import Components */

const SHOW_COPIED_DURATION_MS = 2000;

export default defineComponent({
  name: "CopyButton",
  props: {
    text: {
      type: String,
      required: true
    }
  },
  setup(props: { text: string; }) {
    const hasCopiedTimerId = ref(null);

    function handleClick() {
      navigator.clipboard.writeText(props.text)
      hasCopiedTimerId.value = (setTimeout(() => clearTimer(), SHOW_COPIED_DURATION_MS) as any);
    }

    function clearTimer() {
      hasCopiedTimerId.value = null;
    }

    const hasCopied = () => Boolean(hasCopiedTimerId.value);

    return {
      handleClick,
      hasCopied,
      // clearTimer
    }
  }
});
</script>


<style scoped>
.copy-button {
  border: none;
  height: 30px;
  outline: none;
  padding: 0;
  position: relative;
  width: 30px;
}

.copy-button__icon {
  border: none;
  height: 100%;
  left: 0;
  outline: none;
  position: absolute;
  top: 0;
  width: 100%;
}

.copy-button__input {
  overflow: hidden;
  position: absolute;
  top: -999999px;
  width: 100%;
}

.copy-button__icon {
  background: #fff;
  box-sizing: border-box;
  padding: 3px;
  z-index: 1;
}

.copy-button--has-copied svg {
  fill: #02779e;
}

.copy-button__copied {
  background: #02779e;
  border-radius: 4px;
  border: 1px solid #02779e;
  color: #fff;
  font-size: 12px;
  left: 36px;
  padding: 3px 5px;
  position: absolute;
  top: 4px;
  z-index: 3;
  width: 40px;;
}

.copy-button__copied::before {
  border-bottom: 5px solid transparent;
  border-right: 4px solid #02779e;
  border-top: 5px solid transparent;
  content: '';
  height: 0;
  left: -4px;
  position: absolute;
  top: 5px;
  width: 0;
}
</style>