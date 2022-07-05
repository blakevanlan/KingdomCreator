export interface SelectionParams {
  selectedSupplyIds?: string[];
  selectedAddonIds?: string[];
  selectedBoonIds?: string[];
  selectedAllyId?: string | null;
}

export class Selection implements SelectionParams {
  constructor(
    readonly selectedSupplyIds: string[],
    readonly selectedAddonIds: string[],
    readonly selectedBoonIds: string[],
    readonly selectedAllyId?: string | null,
  ) {
  }

  isEmpty() {
    return Boolean(
      this.selectedSupplyIds.length == 0 &&
      this.selectedAddonIds.length == 0 &&
      this.selectedBoonIds.length == 0 &&
      this.selectedAllyId == null,
    ) 
  }

  contains(id: string) {
    return this.selectedSupplyIds.indexOf(id) != -1 ||
        this.selectedAddonIds.indexOf(id) != -1 ||
        this.selectedBoonIds.indexOf(id) != -1 ||
        this.selectedAllyId == id;
  }

  withParams(params: SelectionParams) {
    return new Selection(
        params.selectedSupplyIds !== undefined ? params.selectedSupplyIds : this.selectedSupplyIds,
        params.selectedAddonIds !== undefined ? params.selectedAddonIds : this.selectedAddonIds,
        params.selectedBoonIds !== undefined ? params.selectedBoonIds : this.selectedBoonIds,
        params.selectedAllyId !== undefined ? params.selectedAllyId : this.selectedAllyId);
  }

  static empty() {
    return new Selection([], [], [], null);
  }
}
