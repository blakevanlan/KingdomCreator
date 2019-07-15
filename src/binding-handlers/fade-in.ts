import * as ko from "knockout";
import * as $ from "jquery";

export function bindFadeIn() {
  ko.bindingHandlers.fadeIn = {
    init: function(
        element: Node,
        valueAccessor: () => boolean,
        allBindingsAccessor: KnockoutAllBindingsAccessor,
        viewModel: any,
        bindingContext: KnockoutBindingContext) {
      const $el = $(element);
      const value = ko.unwrap(valueAccessor());
      fadeIn($el, value);
    },
    update: function(
        element: HTMLImageElement,
        valueAccessor: () => boolean,
        allBindingsAccessor: KnockoutAllBindingsAccessor,
        viewModel: any,
        bindingContext: KnockoutBindingContext) {
      const $el = $(element);
      const value = ko.unwrap(valueAccessor());
      const isVisible = Number($el.css("opacity")) == 1;
      if (!!value != isVisible) {
        fadeIn($el, value);
      }
    }
  };
}

function fadeIn($el: JQuery<Node>, isVisible: boolean) {
  if (isVisible) {
    $el.show();
    setTimeout(() => {$el.css("opacity", "1")}, 0);
  } else {
    $el.hide();
    $el.css("opacity", "0");
  }
}
