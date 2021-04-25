import 'dart:math';

import 'package:quiver/core.dart';

enum CostType {
  treasure2OrLess,
  treasure3,
  treasure4,
  treasure5,
  treasure6,
  treasure7,
  treasure8OrMore,
}

class Cost {
  final int treasure;
  final int potion;
  final int debt;

  Cost(
    this.treasure,
    this.potion,
    this.debt,
  );

  CostType getType() {
    final costs = [
      CostType.treasure2OrLess,
      CostType.treasure2OrLess,
      CostType.treasure2OrLess,
      CostType.treasure3,
      CostType.treasure4,
      CostType.treasure5,
      CostType.treasure6,
      CostType.treasure7,
      CostType.treasure8OrMore,
    ];
    return costs[min(treasure, 8)];
  }

  Cost.fromJson(Map<String, dynamic>? json)
    : treasure = json?['treasure'] as int? ?? 0,
      potion = json?['potion'] as int? ?? 0,
      debt = json?['debt'] as int? ?? 0;

  @override
  bool operator ==(o) => o is Cost && o.treasure == treasure && o.potion == potion && o.debt == debt;

  @override
  int get hashCode => hash3(treasure, potion, debt);
}
