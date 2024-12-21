<template>
  <div :class="cardCover" class="card-cover">
    <div :class="cardDiv" class="card-cover-div">
      <div :class="cardCoverText" class="card-cover-text">
        {{ $t(cardText) }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
/* import Vue, typescript */

import { defineComponent, computed } from "vue";

/* import Dominion Objects and type*/
/* import store  */
/* import Components */

const ANIMATION_DURATION_SEC = 0.6;
const WINDOW_RESIZE_DELAY_MSEC = 300;

export default defineComponent({
  name: "BaneCardCover",
  props: {
    isType: {
      type: String,
      required: true,
    },
  },
  setup(props: { isType: string; }) {

    const cardDiv = computed(() => {
      return props.isType.toLowerCase().replace(/#.*/,"") + "-div"
    });

    const cardCover = computed(() => {
      return props.isType.toLowerCase().replace(/#.*/,"") + "-color"
    });

    const cardCoverText = computed(() => {
      return props.isType.toLowerCase().replace(/#.*/,"") + "-color-text"
    });

    const cardText = computed(() =>{
      return props.isType.toLowerCase().replace("trait#","")
    })

    return {
      cardCover,
      cardDiv,
      cardCoverText,
      cardText,
    }
  }
})
</script>

<style scoped>

.card-cover {
  width: 100%;
  height: 100%;
  position: absolute;
  box-sizing: border-box;
  /* display: flex; */
}

.card-cover-div {
  position:inherit;
  display: flex;
  transform: rotate(+0.75turn);
  align-self: flex-end;
  right: 0%;
  flex-direction: column-reverse;
  bottom:10%;
}
.bane-div{
  bottom: 10%;
}
.ferryman-div{
  bottom: 10%;
}
.obelisk-div{
  bottom: 20%;
}
.mouseway-div{
  bottom: 10%;
}
.trait-div{
  bottom: 10%;
}
.riverboat-div{
  bottom: 10%;
}

.card-cover-text {
  position: absolute;
  padding: 5px 10px;
}



@media (max-width: 600px) {
  .card-cover {
    border-width: 4px;
  }
  .card-cover-text {
    font-size: 10px;
    right: -13px;
  }
  .card-cover-div {
  bottom:30%;
  }
}

@media (600px <= width <= 650px) {
  .card-cover {
    border-width: 5px;
  }

  .card-cover-text {
    font-size: 11px;
    right: -10px;
  }

  .card-cover-div {
  bottom:30%;
  }
}

@media (650px <= width <= 750px) {
  .card-cover-text {
    font-size: 10px;
    right: -13px;
  }

  .card-cover-div {
  bottom:30%;
  }
}
</style>