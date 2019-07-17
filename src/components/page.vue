<template>
  <div>
    <div class="condensed-menu" v-if="isCondensed">
      <ul class="condensed-menu_items">
        <li class="condensed-menu_item" v-for="menuItem in menuItems"
            :class="{active: isMenuItemActive(menuItem)}">
          <a class="condensed-menu_item_link" :href="menuItem.url">{{ menuItem.title }}</a>
        </li>
      </ul>
    </div>
    <div class="page" :class="{'show-condensed-menu': shouldShowCondensedMenu}">
      <header>
        <div class="title-container">
          <h1 class="title">
            <a class="title_link" href="/index.html">Dominion Randomizer</a>
          </h1>
          <h2 class="tagline">{{ subtitle }}</h2>
        </div>
        <div class="condensed-menu-button" v-if="isCondensed" @click="handleMenuClick"></div>
        <div class="menu" v-if="!isCondensed">
          <ul class="menu_items">
            <li class="menu_item" v-for="menuItem in menuItems"
                :class="{active: isMenuItemActive(menuItem)}">
              <a class="menu_item_link" :href="menuItem.url">{{ menuItem.title }}</a>
            </li>
          </ul>
        </div>
      </header>
      <slot></slot>
      <footer>
        Dominion is by Donald X. Vaccarino and published by Rio Grande Games.
        This site has no affiliation with either party.
        Card images are provided by <a href="http://wiki.dominionstrategy.com/index.php/Main_Page">Dominion Strategy Wiki</a>.
        <br>
        <span>
          Icons made by <a href="https://www.flaticon.com/authors/smashicons" title="Smashicons">
          Smashicons</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a>
          is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a>
        </span>
        <br>
        Source on <a href="https://github.com/blakevanlan/KingdomCreator">Github</a>.
        Feature requests and complains go <a href="https://github.com/blakevanlan/KingdomCreator/issues">here</a>!
      </footer>
    </div>
  </div>
</template>

<script lang="ts">
import { Getter } from "vuex-class";
import { Vue, Component, Prop } from "vue-property-decorator";

export enum MenuItemType {
  RANDOMIZER,
  SETS,
}

class MenuItem {
  constructor(readonly type: MenuItemType, readonly title: string, readonly url: string) {
  }
}

const MENU_ITEMS = [
  new MenuItem(MenuItemType.RANDOMIZER, "Randomizer", "/index.html"),
  new MenuItem(MenuItemType.SETS, "Recommended Kingdoms", "/sets.html"),
];

@Component
export default class Heading extends Vue {
  @Prop() readonly subtitle!: string;
  @Prop() readonly selectedType!: MenuItemType;
  @Getter("isCondensed") readonly isCondensed!: boolean;
  isCondensedMenuActive = false;
  menuItems = MENU_ITEMS;

  get shouldShowCondensedMenu() {
    return this.isCondensed && this.isCondensedMenuActive;
  }

  handleMenuClick() {
    this.isCondensedMenuActive = !this.isCondensedMenuActive;
  }

  isMenuItemActive(menuItem: MenuItem) {
    return menuItem.type == this.selectedType;
  }
}
</script>