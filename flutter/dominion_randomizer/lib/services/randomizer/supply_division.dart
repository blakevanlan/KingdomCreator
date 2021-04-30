
import 'package:dominion_randomizer/models/card.dart';
import 'replacements.dart';

class SupplyDivision {
  final Set<Card> availableCards;
  final Set<Card> lockedCards;
  final Set<Card> selectedCards;
  final int totalCount;
  final Replacements replacements;

  SupplyDivision({
    required this.availableCards,
    required this.lockedCards,
    required this.selectedCards,
    required this.totalCount,
    required this.replacements,
  });

  int getUnfilledCount() {
    return totalCount - (lockedCards.length + selectedCards.length);
  }

  bool isFilled() {
    return (lockedCards.length + selectedCards.length) >= totalCount;
  }

  // void check() {
  //   if (lockedAndSelectedCards.length > totalCount) {
  //     throw Exception(
  //       'Cannot create a division with more locked and selected cards than the total count.'
  //     );
  //   }
  //   if (availableCards.length + lockedCards.length + selectedCards.length < totalCount) {
  //     throw Exception(
  //       'Cannot create an unfilled division without enough available cards to fill it.'
  //     );
  //   }
  // }

  SupplyDivision createDivisionByRemovingCards(Iterable<String> cardIds) {
    return SupplyDivision(
      availableCards: availableCards.where((card) => !cardIds.contains(card.id)).toSet(),
      lockedCards: lockedCards,
      selectedCards: selectedCards.where((card) => cardIds.contains(card.id)).toSet(),
      totalCount: totalCount,
      replacements: replacements.createWithout(cardIds),
    );
  }

  SupplyDivision createDivisionByLockingCard({ required String cardId, Set<Card> replacementCards = const {} }) {
    final newReplacements = replacements.createWithout([cardId]);
    newReplacements.replacements[cardId] = replacementCards;
    
    // TODO: FINISH BELOW
    let lockedCard = Cards.findCardById(this.availableCards, cardId);
    if (lockedCard) {
      const cards = this.availableCards.filter(Cards.filterByExcludedIds([cardId]));
      return new SupplyDivision(
          cards, this.lockedCards.concat(lockedCard), this.selectedCards, this.totalCount,
          newReplacements);
    }

    lockedCard = Cards.findCardById(this.selectedCards, cardId);
    if (lockedCard) {
      const cards = this.selectedCards.filter(Cards.filterByExcludedIds([cardId]));
      return new SupplyDivision(
          this.availableCards, this.lockedCards.concat(lockedCard), cards, this.totalCount,
          newReplacements);
    }

    throw new Error("Can\'t lock card: ${cardId}. Not found in available or selected cards.")
  }

  public createDivisionBySelectingCard(cardId: string, replacements: SupplyCard[] = []) {
    const newReplacements = Replacements.createReplacementByRemoveCards(this.replacements, [cardId]);
    newReplacements.set(cardId, replacements.concat());

    const selectedCard = Cards.findCardById(this.availableCards, cardId);
    if (!selectedCard) {
      throw Error(`Can't select card: ${cardId}. Not found in available cards.`);
    }
    const cards = this.availableCards.filter(Cards.filterByExcludedIds([cardId]));
    return new SupplyDivision(
        cards, this.lockedCards, this.selectedCards.concat(selectedCard), this.totalCount,
        newReplacements);
  }

  public createDivisionWithTotalCount(totalCount: number) {
    return new SupplyDivision(
      this.availableCards, this.lockedCards, this.selectedCards, totalCount, this.replacements);
  }
}