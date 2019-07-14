import * as ko from "knockout";
import {MenuItemViewModel} from "../view-models/menu-item-view-model";

export enum MenuItem {
  RANDOMIZER,
  SETS,
}

export class Page {
  readonly subtitle: KnockoutObservable<string>;
  readonly showMenu: KnockoutObservable<boolean>;
  readonly menuItems: MenuItemViewModel[];
  readonly isCondensed: KnockoutObservable<boolean>;

  constructor(subtitle: string, selectedMenuItem: MenuItem) {
    this.subtitle = ko.observable(subtitle);
    this.showMenu = ko.observable(false);
    this.menuItems = Page.createMenuItems(selectedMenuItem);
    this.isCondensed = ko.observable(false);
  }

  toggleMenu() {
    // Scroll to the top of the window before showing the menu to make sure the menu comes into
    // view.
    const showMenu = !this.showMenu();
    if (showMenu) {
      $(window).scrollTop(0);
    }
    this.showMenu(showMenu);
  }

  static createMenuItems(selectedMenuItem: MenuItem) {
    return [
      new MenuItemViewModel("Randomizer", "/index.html", selectedMenuItem == MenuItem.RANDOMIZER),
      new MenuItemViewModel("Recommended Kingdoms", "/sets.html", selectedMenuItem == MenuItem.SETS),
    ] 
  }
}
