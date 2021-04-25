import 'package:dominion_randomizer/models/card.dart';
import 'package:dominion_randomizer/models/cost.dart';
import 'supply_ban.dart';

class CostSupplyBan implements SupplyBan {
  final Set<CostType> costTypes;

  CostSupplyBan(this.costTypes);

  @override
  Iterable<Card> getBannedCards(Iterable<Card> cards) {
    return cards.where((card) => costTypes.contains(card.cost.getType()));
  }
}
