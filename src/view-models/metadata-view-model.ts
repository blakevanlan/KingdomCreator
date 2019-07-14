import * as ko from "knockout";
import {Metadata} from "../models/kingdom";

export class MetadataViewModel {
  readonly useColonies: KnockoutObservable<boolean>;
  readonly useShelters: KnockoutObservable<boolean>;
  readonly show: KnockoutComputed<boolean>;
  constructor() {
    this.useColonies = ko.observable(false);
    this.useShelters = ko.observable(false);
    this.show = ko.computed(() => {
      return this.useColonies() || this.useShelters();
    }); 
  }

  update(metadata: Metadata) {
    this.useColonies(metadata.useColonies);
    this.useShelters(metadata.useShelters);
  }
}
