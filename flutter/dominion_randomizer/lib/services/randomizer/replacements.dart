
class Replacements {
  final Map<String, Set<SupplyCard>>


  Replacements
  constructor(readonly replacements: Map<string, SupplyCard[]>) {
  }

  getReplacementsForId(supplyCardId: string) {
    return this.replacements.has(supplyCardId) ? this.replacements.get(supplyCardId)! : [];
  }

  static empty() {
    return new Replacements(new Map());
  }
  
  static createReplacementByRemoveCards(replacements: Map<string, SupplyCard[]>, cardIds: string[]) {
    const newReplacements: Map<string, SupplyCard[]> = new Map();
    for (let id of replacements.keys()) {
      newReplacements.set(id, replacements.get(id)!.filter(Cards.filterByExcludedIds(cardIds)));
    }
    return newReplacements;
  }
}