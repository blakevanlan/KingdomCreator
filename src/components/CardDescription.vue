<template>
  <div class="card-description-container">
    <div class="card-description" :class="descriptionClass">
      {{ description }}
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

@Component
export default class CardDescription extends Vue {
  @Prop() readonly description!: string;
  @Prop() readonly descriptionClass!: string | null;
}
</script>

<style>
.card-description-container {
  position: absolute;
  font-size: 18px;
  margin-top: -13px;
  top: 50%;
  width: 100%;
  height: 30px;
  text-align: center;
  z-index: 2;
}

.card-description {
  background: rgba(30,30,30,0.7);
  box-sizing: border-box;
  color: #fff;
  display: inline-block;
  margin: 0 auto;
  max-width: 100%;
  padding: 6px 8px;
  text-shadow: 1px 1px 4px #000;
}

</style>