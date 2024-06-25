import { CostType } from "./cost-type"

export class Cost {
  constructor(
    readonly treasure: number,
    readonly potion: number,
    readonly debt: number) {
  }

  getType(): CostType {
    const costs: CostType[] = [
      CostType.TREASURE_2_OR_LESS,
      CostType.TREASURE_2_OR_LESS,
      CostType.TREASURE_2_OR_LESS,
      CostType.TREASURE_3,
      CostType.TREASURE_4,
      CostType.TREASURE_5,
      CostType.TREASURE_6,
      CostType.TREASURE_7,
      CostType.TREASURE_8_OR_MORE,
    ];
    return costs[Math.min(this.treasure, 8)];
  }

  public static fromJson(json: any) {
    return new Cost(
      json["treasure"] || 0,
      json["potion"] || 0,
      json["debt"] || 0);
  }
}