import 'package:dominion_randomizer/models/card.dart';

import 'supply_ban.dart';

class CardSupplyBan implements SupplyBan {
  final Set<String> cardIds;

  CardSupplyBan(this.cardIds);

  @override
  Iterable<Card> getBannedCards(Iterable<Card> cards) {
    return cards.where((card) => cardIds.contains(card.id));
  }
}
