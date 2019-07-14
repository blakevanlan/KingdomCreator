import * as ko from "knockout";
import {DominionSet} from "../dominion/dominion-set";
import {SetId} from "../dominion/set-id";

export class SetViewModel {
  readonly setId: SetId;
  readonly name: string;
  readonly isActive: KnockoutObservable<boolean>;
  constructor(set: DominionSet, isActive: boolean) {
    this.setId = set.setId;
    this.name = set.name;
    this.isActive = ko.observable(isActive)
  }
}