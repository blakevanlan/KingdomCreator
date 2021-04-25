import 'package:dominion_randomizer/models/card.dart';

abstract class SupplyBan {
  Iterable<Card> getBannedCards(Iterable<Card> cards);
}
