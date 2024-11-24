<template>
  <div>
    <div class="condensed-menu" v-if="isCondensed">
      <ul class="condensed-menu_items">
        <li class="condensed-menu_item" v-for="menuItem in getMenuItem(0, false)" :class="{ active: isMenuItemActive(menuItem) }"
          :key="menuItem.url">
          <RouterLink class="condensed-menu_item_link" :to="getMenuItemUrl(menuItem.url)">
                {{ $t(menuItem.title) }}
              </RouterLink>
        </li>
      </ul>
    </div>
    <a id="TopofThePage" />
    <div class="page" :class="{ 'show-condensed-menu': shouldShowCondensedMenu }" :style="condensedMenuHeightStyle" >
      <header>
       <div class="title-container">
          <h1 class="title">
            <router-link class="title_link" :to="getCurrentMenuItemUrl">Dominion Randomizer</router-link>
          </h1>
          <h2 class="tagline">{{ subtitle }}</h2>
        </div> 
        <div class="condensed-menu-button" v-if="isCondensed" @click="handleMenuClick"></div>
        <div class="menu" v-if="!isCondensed">
          <ul class="menu_items">
            <li class="menu_item" v-for="mymenuItem in getMenuItem(5, true)" :key="mymenuItem.title" :class="{ active: isMenuItemActive(mymenuItem) }">
              <router-link class="menu_item_link" :to="getMenuItemUrl(mymenuItem.url)">
                {{ $t(mymenuItem.title) }}
              </router-link>
            </li>
            <li class="menuItemIcon">
            <Menu as="div">
            <MenuButton as="div" class="condensed-menu-button" v-if="!isCondensed"/>
            <MenuItems as="div" class="popOverPanelWrapper">
            <router-link v-for="mymenuItem in getMenuItem(5, false)" :key="mymenuItem.title" class="extended-menu_item_link" :to="getMenuItemUrl(mymenuItem.url)">
              <div class="extended-menu_item" :key="mymenuItem.title">
                      <MenuItem as="div"> {{ $t(mymenuItem.title) }} </MenuItem>
              </div>
            </router-link>
            </MenuItems>
            </Menu>
            </li>
          </ul>
        </div> 
      </header>
      <slot></slot>
      <footer>
        <div class="languages">
          <span v-for="(language, index) in languages" :key="language">
            <router-link :to="getLanguageLinkOptions(language)">
              {{ $t(language) }}
            </router-link>
            <span v-if="index < languages.length - 1" :key="`${language}-bullet`">
              &nbsp;&bull;&nbsp;
            </span>
          </span>
        </div>
        <i18n-t scope="global" class="github-info" keypath="github_info" tag="div">
          <template #source>
            <a :title="PackageDate + ' Release: ' + PackageVersion" :href="PackageURL">{{ $t("github_info_source") }}</a>
          </template>
          <template #issues>
            <a :href="PackageURL +'issues'">{{ $t("github_info_issues") }}</a>
          </template>
        </i18n-t>
        <i18n-t scope="global" class="disclaimers-and-credit" keypath="disclaimers_and_credits" tag="div">
          <template #wiki>
            <a href="http://wiki.dominionstrategy.com/index.php/Main_Page">{{
              $t("disclaimers_and_credits_wiki")
            }}</a>
          </template>
          <template #smashicons>
            <a href="https://www.flaticon.com/authors/smashicons" target="_blank">{{
              $t("disclaimers_and_credits_smashicons")
            }}</a>
          </template>
          <template #flaticon>
            <a href="https://www.flaticon.com/" target="_blank">www.flaticon.com</a>
          </template>
          <template #creativecommons>
            <a href="http://creativecommons.org/licenses/by/3.0/" target="_blank">{{
              $t("disclaimers_and_credits_creative_commons")
            }}</a>
          </template>
        </i18n-t>
      </footer>
    </div>
  </div>
</template>

<script lang="ts">
/* import Vue, typescript */
import { defineComponent, computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from 'vue-router';
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'

/* import Dominion Objects and type*/

/* import store  */
import { useWindowStore } from "../pinia/window-store";
import { usei18nStore } from "../pinia/i18n-store";
import { Language } from "../i18n/language";

/* import Components */

export enum MenuItemType {
  RANDOMIZER,
  SETS,
  RULES,
  CARDS,
  BOXES,
  SETTINGS
}

class LocalMenuItem {
  constructor(readonly type: MenuItemType, readonly title: string, readonly url: string) {
  }
}

let MENU_ITEMS = [
  new LocalMenuItem(MenuItemType.RANDOMIZER, "Randomizer", "/index"),
  new LocalMenuItem(MenuItemType.SETS, "Recommended Kingdoms", "/sets"),
  new LocalMenuItem(MenuItemType.RULES, "Rules", "/rulebooks"),
  new LocalMenuItem(MenuItemType.BOXES, "Box content", "/boxes"),
  new LocalMenuItem(MenuItemType.SETTINGS, "Settings", "/settings")
];

if (process.env.NODE_ENV == "development") {
  MENU_ITEMS.push(new LocalMenuItem(MenuItemType.CARDS, "Cards", "/cards"));
}


export default defineComponent({
  name: "Page",
  props: {
    subtitle: String,
    selectedType: Number
  },
  components: {
  //  Popover, PopoverButton, PopoverPanel,
    Menu, MenuButton, MenuItems, MenuItem
  },
  setup(props) {
    const PackageVersion = Pkgejson_Version;
    const PackageURL = Pkgejson_URL;
    const PackageDate = Pkgejson_Date;
    const route = useRoute();
    const WindowStore = useWindowStore();
    const i18nStore = usei18nStore();

   

    const { t } = useI18n();
    const language = computed(() => i18nStore.language);
    const isCondensedMenuActive = ref(false);
    const isCondensed = computed(() =>{ return WindowStore.isCondensed });
    const shouldShowCondensedMenu = computed(()=> { return isCondensed.value && isCondensedMenuActive.value });
    const languages = computed(() => { return Object.values(Language) });
    const isMenuItemActive = (menuItem: LocalMenuItem) => menuItem.type === props.selectedType;
    const condensedMenuHeightStyle = computed(()=> { 
        const condensedMenuHeight= (10 + MENU_ITEMS.length * 42); 
        const returnStr = " transform: translate(0, "+ condensedMenuHeight+"px); "
        if (isCondensedMenuActive.value) return returnStr;
        return ""
      });

    const getMenuItemUrl = (url: string) => {
      return {
          path: url,
          query: {
            ...route.query,
            lang: language.value,
          }
        };
      };

    const getCurrentMenuItemUrl = computed(() =>{
      return {
          path: '/',
          query: {...route.query }
        };      
    });

    const getMenuItem = ((nbEntry: number, FirstPart: boolean) => { 
      /* allow nb entry larger than 2 if 
       * Border 20
       * Title Main : 385
       * Randomizer menu : 125
       * Recommended kigndom menu : 220
       * Rules : 75
       * Menu button : 80
       * Ajustement : 75
       */
      // forcing only 2 menu
      if (WindowStore.width < (20 + 385 +  125 + 220 + 75 + 80 + 75)) {
        return FirstPart ?  
          MENU_ITEMS.slice(0, 2):
          MENU_ITEMS.slice(2,10);
      }
      return FirstPart ?  
          MENU_ITEMS.slice(0, nbEntry):
          MENU_ITEMS.slice(nbEntry,10);
    });

    const getLanguageLinkOptions = (language: string) => {
      return {
        params: route.params,
        query: {
          ...route.query,
          lang: language,
        }
      };
    };

    const handleMenuClick = () => {
      isCondensedMenuActive.value = !isCondensedMenuActive.value;
    };

    return {
      isCondensed,
      isCondensedMenuActive,
      shouldShowCondensedMenu,
      condensedMenuHeightStyle,
      languages,
      getMenuItem,
      getMenuItemUrl,
      getCurrentMenuItemUrl,
      getLanguageLinkOptions,
      handleMenuClick,
      isMenuItemActive,
      PackageVersion,
      PackageURL,
      PackageDate,
    };
  },
});
</script>

<style scoped>
footer {
  border-top: 1px #ddd solid;
  font-family: 'Alegreya Sans', sans-serif;
  font-weight: 300;
  margin: 10px -10px -10px -10px;
  padding: 10px;
}

.languages {
  text-align: center;
  font-size: 12px;
}

.github-info {
  font-size: 15px;
  margin: 12px 0;
  text-align: center;
}

.disclaimers-and-credit {
  font-size: 12px;
  max-width: 600px;
  margin: 0 auto;
}

.menuItemIcon {
  display: block;
  padding: 8px 20px ;
  border: unset;
/*  position: relative;*/
  list-style: none;
}

.menu-layer {
  background-color: rgba(113, 179, 200, 0.9); /* White background with some transparency */
  z-index: 10; /* Sets the layer above other elements */
  /* Adjust width as needed based on your menu content */
  width: 200px; 
  display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: space-between;
    flex-wrap: nowrap;
}


.extended-menu_items {
  list-style: none; /* Removes default bullet points */
  position: relative;
  display: flex;
  padding: 12px 10px 8px 10px;
  flex-direction: column;
  margin: 0
}

.extended-menu_item {
  /*margin-bottom: 5px; /* Spacing between menu items */
  display: block;
  padding: 4px 16px ;
  flex: none;
}

.extended-menu_item_link {
  color: #ddd;
  display: inline-block;
  font-size: 20px;
  border-top: 1px solid transparent;
  border-bottom: 1px solid transparent;
  padding: 4px 0;
  text-decoration: none;
}

.extended-menu_item.active .extended-menu_item_link {
  color: #fff;
  border-bottom: 1px solid #fff;
}

.popOverPanelWrapper {
  position: absolute;
  background-color: rgba(113, 179, 200, 0.9); /* White background with some transparency */
  top: 70%; /* Initial position below the button */
  right: 0%; /* Align left edge with button */
  z-index: 10;
  outline-style: unset;
  display:flex;
  flex-direction: column;
}

 

</style>