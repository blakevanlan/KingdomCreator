import * as ko from "knockout";

export function bindSlideVisible() {
  ko.bindingHandlers.slideVisible = {
    update: function(
        element: Node,
        valueAccessor: () => boolean,
        allBindingsAccessor: KnockoutAllBindingsAccessor,
        viewModel: any,
        bindingContext: KnockoutBindingContext) {
      const value = ko.unwrap(valueAccessor());
      const duration: number = (allBindingsAccessor.get("slideDuration") as number | null) || 400;
      if (value) {
        $(element).slideDown(duration);
      } else {
        $(element).slideUp(duration);
      }
    }
  };
}
