export interface SelectionParams {
  selectedSupplyIds?: string[];
  selectedAddonIds?: string[];
}

export class Selection implements SelectionParams {
  constructor(readonly selectedSupplyIds: string[], readonly selectedAddonIds: string[]) {
  }

  isEmpty() {
    return this.selectedSupplyIds.length == 0 && this.selectedAddonIds.length == 0;
  }

  contains(id: string) {
    return this.selectedSupplyIds.indexOf(id) != -1 || this.selectedAddonIds.indexOf(id) != -1;
  }

  withParams(params: SelectionParams) {
    return new Selection(
        params.selectedSupplyIds !== undefined ? params.selectedSupplyIds : this.selectedSupplyIds,
        params.selectedAddonIds !== undefined ? params.selectedAddonIds : this.selectedAddonIds);
  }

  static empty() {
    return new Selection([], []);
  }
}
