
import 'package:dominion_randomizer/models/card.dart';

class Replacements {
  final Map<String, Set<Card>> replacements;

  Replacements(this.replacements);

  Replacements.empty()
    : replacements = {};

  Set<Card> forId(String cardId) {
    return replacements[cardId] ?? {};
  }

  Replacements createWithout(Iterable<String> cardIds) {
    final cardIdsSet = cardIds.toSet();
    return Replacements(
      replacements.map((key, value) =>
       MapEntry<String, Set<Card>>(key, value.where((card) => !cardIdsSet.contains(card.id)).toSet()))
    );
  }
}