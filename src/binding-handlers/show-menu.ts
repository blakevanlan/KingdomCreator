import * as ko from "knockout";
import * as $ from "jquery";
import {Cards} from "../utils/cards";
import {DominionSets} from "../dominion/dominion-sets";
import {SetId} from "../dominion/set-id";

interface ShowMenuOptions {
  enabled: boolean;
  show: boolean;
}

export function bindShowMenu() {
  ko.bindingHandlers.showMenu = {
    init: function(
        element: Node,
        valueAccessor: () => ShowMenuOptions,
        allBindingsAccessor: KnockoutAllBindingsAccessor,
        viewModel: any,
        bindingContext: KnockoutBindingContext) {
      $(window).on("resize", () => {
        const $element = $(element);
        const $child = $element.children();
        const enabled = ko.utils.domData.get(element, "showMenu-enabled");
        const show = ko.utils.domData.get(element, "showMenu-show");
        if (enabled) {
          $element.height(show ? $child.outerHeight()! : 0);
        }
      });
    },
    update: function(
        element: Node,
        valueAccessor: () => ShowMenuOptions,
        allBindingsAccessor: KnockoutAllBindingsAccessor,
        viewModel: any,
        bindingContext: KnockoutBindingContext) {
      const value = ko.unwrap(valueAccessor());
      const enabled = ko.unwrap(value.enabled);
      const show = ko.unwrap(value.show);
      const $element = $(element);
      ko.utils.domData.set(element, "showMenu-enabled", enabled);
      ko.utils.domData.set(element, "showMenu-show", show);
      if (enabled) {
        $element.height(show ? $element.children().outerHeight()! : 0);
      } else {
        $element.css("height", "auto");
      }
    }
  }
}