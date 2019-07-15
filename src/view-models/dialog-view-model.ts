/// <reference path="../../typings/vex-js.extension.d.ts" />
import * as ko from "knockout";
import * as vex from "vex-js";
import {CardType} from "../dominion/card-type";
import {CostType} from "../dominion/cost-type";
import {DominionSets} from "../dominion/dominion-sets";
import {SetId} from "../dominion/set-id";

class NamedViewModel<T> {
  readonly isActive: KnockoutObservable<boolean>;
  constructor(readonly id: T, readonly name: string) {
    this.isActive = ko.observable(true);
  }
}

export class DialogViewModel {
  static ALL_OPTION_ID = "all";
  readonly sets: KnockoutObservableArray<NamedViewModel<string>>;
  readonly selectedSetId: KnockoutObservable<string>;
  readonly supplyCardTypes: NamedViewModel<string>[];
  readonly selectedType: KnockoutObservable<string>;
  readonly costs: NamedViewModel<CostType>[];
  readonly isSetsSectionOpen: KnockoutObservable<boolean>;
  readonly isSupplyCardTypesSectionOpen: KnockoutObservable<boolean>;
  readonly isCostsSectionOpen: KnockoutObservable<boolean>;
  vexDialogId: number | null;
  callback: (() => void) | null;

  constructor() {
    // Create new set objects so they can be clicked on 
    this.sets = ko.observableArray();
    this.selectedSetId = ko.observable(DialogViewModel.ALL_OPTION_ID);
    this.supplyCardTypes = this.createSupplyCardTypes();
    this.selectedType = ko.observable(DialogViewModel.ALL_OPTION_ID);
    this.costs = this.createCosts();
    this.isSetsSectionOpen = ko.observable(false);
    this.isSupplyCardTypesSectionOpen = ko.observable(false);
    this.isCostsSectionOpen = ko.observable(false);
    this.vexDialogId = null;
    this.callback = null;
  }

  toggleSetsSection() {
    this.isSetsSectionOpen(!this.isSetsSectionOpen());
  }

  toggleSupplyCardTypesSection() {
    this.isSupplyCardTypesSectionOpen(!this.isSupplyCardTypesSectionOpen());
  }

  toggleCostsSection() {
    this.isCostsSectionOpen(!this.isCostsSectionOpen());
  }

  fetchNewCards() {
    if (this.callback) {
      this.callback();
    }
    this.close();
  }

  open(activeSetIds: SetId[], callback: () => void) {
    this.callback = callback;
    this.sets(this.createSets(activeSetIds));
    this.checkSelectedSetState();
    let $content: JQuery | null = null;
    const vexOptions = {
      afterOpen: ($vexContent: JQuery) => {
        $content = $(".dialog-hidden-content .dialog-content").first().detach();
        $vexContent.append($content);
      },
      beforeClose: () => {
        $content!.detach().appendTo($(".dialog-hidden-content"));
      },
      afterClose: () => {
        this.vexDialogId = null;
      },
      className: "vex-theme-os"
    }; // as any;
    const $dialog = vex.open(vexOptions);
    this.vexDialogId = $dialog.data().vex.id as number;
  }
  
  resetOptions() {
    this.selectedSetId(DialogViewModel.ALL_OPTION_ID);
    this.selectedType(DialogViewModel.ALL_OPTION_ID);
    for (let cost of this.costs) {
      cost.isActive(true);
    }
  }

  close() {
    if (this.vexDialogId) {
      vex.close(this.vexDialogId);
      this.callback = null;
    }
  }

  createSets(activeSetIds: SetId[]) {
    const newSets = [new NamedViewModel(DialogViewModel.ALL_OPTION_ID, 'Any')];
    for (let setId of activeSetIds) {
      const set = DominionSets.getSetById(setId);
      newSets.push(new NamedViewModel<string>(set.setId, set.name));
    }
    return newSets;
  }

  checkSelectedSetState() {
    const selectedSetId = this.selectedSetId();
    const sets = this.sets();
    for (let set of sets) {
      if (set.id == selectedSetId) {
        return;
      }
    }
    this.selectedSetId(DialogViewModel.ALL_OPTION_ID);
  }

  createSupplyCardTypes(): NamedViewModel<string>[] {
    return [
      new NamedViewModel(DialogViewModel.ALL_OPTION_ID, 'Any'),
      new NamedViewModel(CardType.DRAWER, '+ Cards'),
      new NamedViewModel(CardType.BUY_SUPPLIER, '+1 Buy'),
      new NamedViewModel(CardType.ACTION_SUPPLIER, '+2 Actions'),
      new NamedViewModel(CardType.ACTION, 'Action'),
      new NamedViewModel(CardType.ATTACK, 'Attack'),
      new NamedViewModel(CardType.DURATION, 'Duration'),
      new NamedViewModel(CardType.REACTION, 'Reaction'),
      new NamedViewModel(CardType.RESERVE, 'Reserve'),
      new NamedViewModel(CardType.TRASHING, 'Trashing'),
      new NamedViewModel(CardType.TREASURE, 'Treasure'),
      new NamedViewModel(CardType.VICTORY, 'Victory')
    ];
  }

  createCosts(): NamedViewModel<CostType>[] {
    return [
      new NamedViewModel(CostType.TREASURE_2_OR_LESS, '1-2'),
      new NamedViewModel(CostType.TREASURE_3, '3'),
      new NamedViewModel(CostType.TREASURE_4, '4'),
      new NamedViewModel(CostType.TREASURE_5, '5'),
      new NamedViewModel(CostType.TREASURE_6, '6'),
      new NamedViewModel(CostType.TREASURE_7, '7'),
      new NamedViewModel(CostType.TREASURE_8_OR_MORE, '8+')
    ];
  }
}