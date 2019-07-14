import * as ko from "knockout";
import {Page} from "../pages/page";

const PADDING = 8;

export function bindShowFloating() {
  ko.bindingHandlers.showFloating = {
    init: function(
        element: Node,
        valueAccessor: () => string,
        allBindingsAccessor: KnockoutAllBindingsAccessor,
        viewModel: Page,
        bindingContext: KnockoutBindingContext) {
      const $tracked = $(ko.utils.unwrapObservable(valueAccessor()));
      const $el = $(element);
      const $win = $(window);
      $win.scroll(() => {
        const offset = $tracked.offset()!.top - PADDING;
        if ($win.scrollTop()! > offset && viewModel.isCondensed()) {
          $el.addClass("visible");
          $tracked.addClass("hidden");
        } else {
          $el.removeClass("visible");
          $tracked.removeClass("hidden");
        }
      });
    }
  };
}
