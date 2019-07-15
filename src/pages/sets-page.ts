import {DominionSets} from "../dominion/dominion-sets";
import {DominionKingdoms} from "../dominion/dominion-kingdoms";
import {DominionKingdom} from "../dominion/dominion-kingdom";
import {MenuItem} from "./page";
import {Page} from "./page";
import {SetId} from "../dominion/set-id";
import {SetViewModel} from "../view-models/set-view-model";
import {getMessageForAddonsDescription} from "../utils/messages";

const SUBTITLE = "Recommended Sets of 10";
const FOUR_COLUMN_WIDTH = 450;

const STARTING_SELECTED_SET = SetId.BASE_SET;
const SETS_TO_IGNORE =
    new Set([SetId.BASE_SET_2, SetId.INTRIGUE_2, SetId.PROMOS]);

export class SetsPage extends Page {
  readonly sets: KnockoutObservableArray<SetViewModel>;
  readonly selectedSetId: KnockoutObservable<SetId>;
  readonly visibleKingdoms: KnockoutComputed<DominionKingdom[]>;
  readonly numberOfColumns: KnockoutObservable<number>;
  
  constructor() {
    super(SUBTITLE, MenuItem.SETS);
    this.sets = ko.observableArray(this.createSetViewModels());
    this.selectedSetId = ko.observable(STARTING_SELECTED_SET);
    this.visibleKingdoms = this.createVisibleKingdomsObservable();
    this.numberOfColumns = ko.observable(4);
    this.listenForResizeAndSetNumberOfColumns();
  }

  createRows = (ids: string) => {
    const numberOfColumns = this.numberOfColumns();
    const rows: string[] = [];
    for (let rowIndex = 0; rowIndex < numberOfColumns; rowIndex++) {
      const startingIndex = rowIndex * numberOfColumns;
      rows.push(ids.slice(startingIndex, startingIndex + numberOfColumns));
    }
    return rows;
  }

  titleForAddons = (kingdom: DominionKingdom) => {
    const hasEvents = kingdom.eventIds.length > 0;
    const hasLandmarks = kingdom.landmarkIds.length > 0;
    const hasProjects = kingdom.projectIds.length > 0;
    return getMessageForAddonsDescription(hasEvents, hasLandmarks, hasProjects);
  };

  addonIds = (kingdom: DominionKingdom): string[] => {
    return (kingdom.eventIds).concat(kingdom.landmarkIds, kingdom.projectIds);
  };

  private createSetViewModels(): SetViewModel[] {
    const sets = DominionSets.getAllSets().concat().sort((a, b) => {
      return a.name == b.name ? 0 : a.name < b.name ? -1 : 1;
    });
    const setViewModels: SetViewModel[] = [];
    for (let set of sets) {
      if (!SETS_TO_IGNORE.has(set.setId)) {
        setViewModels.push(new SetViewModel(set, false));
      }
    }
    return setViewModels;
  }

  private createVisibleKingdomsObservable() {
    return ko.pureComputed(() => {
      const kingdoms = DominionKingdoms.kingdoms[this.selectedSetId()]!;
      return kingdoms.sort(SetsPage.compareKingdoms);
    });
  }

  private listenForResizeAndSetNumberOfColumns() {
    $(window).resize(() => this.updateNumberOfColumns()); 
    this.updateNumberOfColumns();
  }

  private updateNumberOfColumns() {
    const isFourColumnWidth = $(window).width()! <= FOUR_COLUMN_WIDTH;
    this.numberOfColumns(isFourColumnWidth ? 4 : 5);
  }

  private static compareKingdoms(a: DominionKingdom, b: DominionKingdom) {
    const setsFromA = a.setIds.concat().sort();
    const setsFromB = b.setIds.concat().sort();
    if (setsFromA.length != setsFromB.length) {
      return setsFromA.length < setsFromB.length ? -1 : 1;
    }
    if (setsFromA[0] != setsFromB[0]) {
      return setsFromA[0] < setsFromB[0] ? -1 : 1;
    }
    for (let i = 1; i < setsFromA.length; i++) {
      if (setsFromA[i] != setsFromB[i]) {
        return setsFromA[i] < setsFromB[i] ? -1 : 1;
      }
    }
    return 0;
  }
}
