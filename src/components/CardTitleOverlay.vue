<template>
  <TextOverlay class="card-title-overlay">
    <span :class="titleClass">
      {{ title }}
    </span>
  </TextOverlay>
</template>


<script lang="ts">
import TextOverlay from "./TextOverlay";
import { Vue, Component, Prop } from "vue-property-decorator";

@Component({
  components: {
    TextOverlay
  }
})
export default class CardTitleOverlay extends Vue {
  @Prop() readonly title!: string;
  @Prop() readonly titleClass!: string | null;
}
</script>

<style>
.card-title-overlay {
  margin-top: -13px;
}
</style>