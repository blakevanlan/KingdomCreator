<template>
  <a class="rulebook" target="_rulebookDominion" :href="rulebookUrl">
    <img class="rulebook__img" :src="imageUrl" />
    <CardDescription
      :description="rulebook.name"
      :description-class="rulebook.id"
    />
  </a>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { getSetImageUrl, getRulebookUrl } from "../utils/resources";
import CardDescription from "./CardDescription.vue";

export interface RulebookInterface {
  id: string;
  name: string;
}

@Component({
  components: {
    CardDescription,
  }
})
export default class Rulebook extends Vue {
  constructor() {
    super();
  }
  @Prop() readonly rulebook!: RulebookInterface;

  get imageUrl() {
    return getSetImageUrl(this.rulebook.id);
  }

  get rulebookUrl() {
    return getRulebookUrl(this.rulebook.id);
  }
}
</script>

<style>
.rulebook,
.rulebook__img {
  height: 100%;
  pointer-events: all;
  position: absolute;
  top: 0;
  width: 100%;
}

@media (max-width: 900px) {
  .rulebook .card-description {
    font-size: 16px;
  }

  .rulebook .baseset2,
  .rulebook .intrigue2,
  .rulebook .hinterlands,
  .rulebook .guildscornicopia {
    font-size: 14px;
  }
}  

@media (max-width: 400px) {
  .rulebook .card-description {
    font-size: 10px
  }
}
</style>