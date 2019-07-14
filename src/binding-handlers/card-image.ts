import * as ko from "knockout";
import {Card} from "../dominion/card";

const IMAGE_PREFEX = "/img/cards";

export function bindCardImage() {
  ko.bindingHandlers.cardImage = {
    update: function(
        element: HTMLImageElement,
        valueAccessor: () => string | Card,
        allBindingsAccessor: KnockoutAllBindingsAccessor,
        viewModel: any,
        bindingContext: KnockoutBindingContext) {
      const cardOrId = valueAccessor();
      const cardId = typeof cardOrId == "string" ? cardOrId : (cardOrId as Card).id;
      element.src = `${IMAGE_PREFEX}/${cardId}.jpg`;
    }
  };
}
