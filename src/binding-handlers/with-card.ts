import * as ko from "knockout";
import {DominionSets} from "../dominion/dominion-sets";

export function bindWithCard() {
  ko.bindingHandlers.withCard = {
    init: function(
        element: Node,
        valueAccessor: () => string,
        allBindingsAccessor: KnockoutAllBindingsAccessor,
        viewModel: any,
        bindingContext: KnockoutBindingContext) {
      const card = DominionSets.getCardById(ko.unwrap(valueAccessor()));
      return ko.bindingHandlers.with.init!(
          element, () => card, allBindingsAccessor, viewModel, bindingContext);
    },
    update: function(
        element: Node,
        valueAccessor: () => string,
        allBindingsAccessor: KnockoutAllBindingsAccessor,
        viewModel: any,
        bindingContext: KnockoutBindingContext) {
      const card = DominionSets.getCardById(ko.unwrap(valueAccessor()));
      return ko.bindingHandlers.with.update!(
          element, () => card, allBindingsAccessor, viewModel, bindingContext);
    }
  };
}
