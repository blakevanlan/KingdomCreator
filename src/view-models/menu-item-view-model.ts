import * as ko from "knockout";

export class MenuItemViewModel {
  readonly isActive: KnockoutObservable<boolean>;
  constructor(readonly title: string, readonly url: string, isActive: boolean) {
     this.isActive = ko.observable(!!isActive);
  }
}
