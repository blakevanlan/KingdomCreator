import * as ko from "knockout";
import * as $ from "jquery";
import {DominionSets} from "../dominion/dominion-sets";
import {SetId} from "../dominion/set-id";

export function bindDominionSetNames() {
  ko.bindingHandlers.dominionSetNames = {
    update: function(
        element: Node,
        valueAccessor: () => SetId[],
        allBindingsAccessor: KnockoutAllBindingsAccessor,
        viewModel: any,
        bindingContext: KnockoutBindingContext) {
      const setIds = ko.unwrap(valueAccessor());
      const elements: string[] = [];
      for (let setId of setIds) {
        const set = DominionSets.getSetById(setId);
        elements.push(`<span class="set-name ${setId}">${set.name}</span>`);
      }
      $(element).html(elements.join(' '));
    }
  };
}