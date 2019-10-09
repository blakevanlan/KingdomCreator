export interface SelectionParams {
  selectedSupplyIds?: string[];
  selectedbaneSupplyIds?: string[];
  selectedAddonIds?: string[];
  selectedBoonIds?: string[];
}

export class Selection implements SelectionParams {
  constructor(
    readonly selectedSupplyIds: string[],
    readonly selectedbaneSupplyIds: string[],
    readonly selectedAddonIds: string[],
    readonly selectedBoonIds: string[],
  ) {
  }

  isEmpty() {
    return this.selectedSupplyIds.length == 0 &&
      this.selectedbaneSupplyIds.length == 0 &&
      this.selectedAddonIds.length == 0 &&
      this.selectedBoonIds.length == 0;
  }

  contains(id: string) {
    return this.selectedSupplyIds.indexOf(id) != -1 ||
        this.selectedbaneSupplyIds.indexOf(id) != -1 ||
        this.selectedAddonIds.indexOf(id) != -1 ||
        this.selectedBoonIds.indexOf(id) != -1;
  }

  withParams(params: SelectionParams) {
    return new Selection(
        params.selectedSupplyIds !== undefined ? params.selectedSupplyIds : this.selectedSupplyIds,
        params.selectedbaneSupplyIds !== undefined ? params.selectedbaneSupplyIds : this.selectedbaneSupplyIds,
        params.selectedAddonIds !== undefined ? params.selectedAddonIds : this.selectedAddonIds,
        params.selectedBoonIds !== undefined ? params.selectedBoonIds : this.selectedBoonIds);
  }

  static empty() {
    return new Selection([], [], [], []);
  }
}
