import * as ko from "knockout";
import * as $ from "jquery";
import {DominionSets} from "../dominion/dominion-sets";
import {SetId} from "../dominion/set-id";

interface ObjectWithSetId {
  setId: SetId;
}

export function bindDominionSetName() {
  ko.bindingHandlers.dominionSetName = {
    update: function(
        element: Node,
        valueAccessor: () => string | ObjectWithSetId,
        allBindingsAccessor: KnockoutAllBindingsAccessor,
        viewModel: any,
        bindingContext: KnockoutBindingContext) {
      const value = valueAccessor();
      const setId = typeof value == "string" ? value as SetId : value.setId;
      const set = DominionSets.getSetById(setId);
      $(element).html(`<span class="set-name ${setId}">${set.name}</span>`);
    }
  };
}
