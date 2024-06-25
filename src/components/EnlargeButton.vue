<template>
  <a class="expand-view-button" v-if="isCondensed" @click="handleClick">
    <div class="expand-view-button-icon"
      :class="{'expand-view-button-icon--enlarged': isEnlarged}"
    >
    </div>
  </a>
</template>

<script lang="ts">
/* import Vue, typescript */
import { defineComponent, computed } from "vue";

/* import Dominion Objects and type*/
/* import store  */
import { useWindowStore } from '../pinia/window-store';

/* import Components */

export default defineComponent({
  name: 'EnlargeButton',
  setup() {
    const windowStore = useWindowStore();
    
    const isCondensed = computed(() => {
      return windowStore.isCondensed;
    });
    
    const isEnlarged = computed(() => {
      return windowStore.isEnlarged;
    });
    
    const handleClick = () => {
      windowStore.setEnlarged(!isEnlarged.value);
    };
    
    return {
      isCondensed,
      isEnlarged,
      handleClick,
    };
  },
});
</script>


<style scoped>
.expand-view-button {
  position: fixed;
  right: 0;
  width: 48px;
  height: 48px;
  bottom: 24px;
  border: 1px solid #ccc;
  border-radius: 5px 0 0 5px;
  border-right: 0;
  background: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  z-index: 500;
}

.expand-view-button-icon {
  display: block;
  margin: 6px;
  height: 36px;
  width: 36px;
  background-image: url("data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDU5LjIgNTkuMiIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNTkuMiA1OS4yOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgd2lkdGg9IjY0cHgiIGhlaWdodD0iNjRweCI+CjxnPgoJPHBhdGggZD0iTTUxLjA2MiwyMS41NjFjLTExLjg4OS0xMS44ODktMzEuMjMyLTExLjg4OS00My4xMjEsMEwwLDI5LjUwMWw4LjEzOCw4LjEzOGM1Ljk0NCw1Ljk0NCwxMy43NTIsOC45MTcsMjEuNTYxLDguOTE3ICAgczE1LjYxNi0yLjk3MiwyMS41NjEtOC45MTdsNy45NDEtNy45NDFMNTEuMDYyLDIxLjU2MXogTTQ5Ljg0NSwzNi4yMjVjLTExLjEwOSwxMS4xMDgtMjkuMTg0LDExLjEwOC00MC4yOTMsMGwtNi43MjQtNi43MjQgICBsNi41MjctNi41MjdjMTEuMTA5LTExLjEwOCwyOS4xODQtMTEuMTA4LDQwLjI5MywwbDYuNzI0LDYuNzI0TDQ5Ljg0NSwzNi4yMjV6IiBmaWxsPSIjMDI3NzllIi8+Cgk8cGF0aCBkPSJNMjguNTcyLDIxLjU3Yy0zLjg2LDAtNywzLjE0LTcsN2MwLDAuNTUyLDAuNDQ4LDEsMSwxczEtMC40NDgsMS0xYzAtMi43NTcsMi4yNDMtNSw1LTVjMC41NTIsMCwxLTAuNDQ4LDEtMSAgIFMyOS4xMjUsMjEuNTcsMjguNTcyLDIxLjU3eiIgZmlsbD0iIzAyNzc5ZSIvPgoJPHBhdGggZD0iTTI5LjU3MiwxNi41N2MtNy4xNjgsMC0xMyw1LjgzMi0xMywxM3M1LjgzMiwxMywxMywxM3MxMy01LjgzMiwxMy0xM1MzNi43NDEsMTYuNTcsMjkuNTcyLDE2LjU3eiBNMjkuNTcyLDQwLjU3ICAgYy02LjA2NSwwLTExLTQuOTM1LTExLTExczQuOTM1LTExLDExLTExczExLDQuOTM1LDExLDExUzM1LjYzOCw0MC41NywyOS41NzIsNDAuNTd6IiBmaWxsPSIjMDI3NzllIi8+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==");
  background-size: contain;
}

.expand-view-button-icon--enlarged {
  background-image: url("data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDU5LjIgNTkuMiIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNTkuMiA1OS4yOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgd2lkdGg9IjY0cHgiIGhlaWdodD0iNjRweCI+CjxnPgoJPHBhdGggZD0iTTUxLjA2MiwyMS41NjFjLTUuNzU5LTUuNzU5LTEzLjQxNi04LjkzMS0yMS41NjEtOC45MzFTMTMuNywxNS44MDEsNy45NDEsMjEuNTYxTDAsMjkuNTAxbDguMTM4LDguMTM4ICAgYzUuNzU5LDUuNzU5LDEzLjQxNiw4LjkzMSwyMS41NjEsOC45MzFzMTUuODAyLTMuMTcxLDIxLjU2MS04LjkzMWw3Ljk0MS03Ljk0MUw1MS4wNjIsMjEuNTYxeiBNNDkuODQ1LDM2LjIyNSAgIGMtNS4zODEsNS4zODEtMTIuNTM2LDguMzQ1LTIwLjE0Niw4LjM0NXMtMTQuNzY1LTIuOTYzLTIwLjE0Ni04LjM0NWwtNi43MjQtNi43MjRsNi41MjctNi41MjcgICBjNS4zODEtNS4zODEsMTIuNTM2LTguMzQ1LDIwLjE0Ni04LjM0NXMxNC43NjUsMi45NjMsMjAuMTQ2LDguMzQ1bDYuNzI0LDYuNzI0TDQ5Ljg0NSwzNi4yMjV6IiBmaWxsPSIjMDI3NzllIi8+Cgk8cGF0aCBkPSJNMjkuNTcyLDE2LjU3Yy03LjE2OCwwLTEzLDUuODMyLTEzLDEzczUuODMyLDEzLDEzLDEzczEzLTUuODMyLDEzLTEzUzM2Ljc0MSwxNi41NywyOS41NzIsMTYuNTd6IE0yOS41NzIsMjQuNTcgICBjLTIuNzU3LDAtNSwyLjI0My01LDVjMCwwLjU1Mi0wLjQ0OCwxLTEsMXMtMS0wLjQ0OC0xLTFjMC0zLjg2LDMuMTQtNyw3LTdjMC41NTIsMCwxLDAuNDQ4LDEsMVMzMC4xMjUsMjQuNTcsMjkuNTcyLDI0LjU3eiIgZmlsbD0iIzAyNzc5ZSIvPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=")
}
  
</style>