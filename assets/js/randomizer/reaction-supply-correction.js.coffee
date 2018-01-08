#= require randomizer/supply-correction.js.coffee
#= require randomizer/supply-divisions.js.coffee
#= require models/card-type.js.coffee
#= require utils/card-util.js.coffee
#= require utils/rand-util.js.coffee
#= require utils/segmented-range.js.coffee

do ->
   CardType = window.CardType
   CardUtil = window.CardUtil
   RandUtil = window.RandUtil
   SegmentedRange = window.SegmentedRange
   SupplyCorrection = window.SupplyCorrection
   SupplyDivisions = window.SupplyDivisions

   class ReactionSupplyCorrection extends SupplyCorrection
      isSatisfied: (divisions) ->
         selectedCards = @getLockedAndSelectedCards(divisions)
         if @hasReaction(selectedCards)
            return true 

         # Correction is not satisfied if there are locked attacks without any reactions.
         if selectedCards.filter(CardUtil.filterByRequiredType(CardType.ATTACK)).length
            return false

         # Correction is unsatisfied if there are available attacks.
         attacks = SupplyDivisions.getAvailableCardsOfType(divisions, CardType.ATTACK)
         if attacks.length
            return false

         # Correction satisfied if there are no available attacks.
         return true

      allowLockedCard: (divisions, card) ->
         console.log("checking if card is allowed: #{card.id}")
         if not card.isAttack
            return true 
         if @hasReaction(@getLockedAndSelectedCards(divisions))
            console.log("attack allowed because reaction exists")
            return true 

         availableReactionsPerDivision =
               SupplyDivisions.getAvailableCardsOfTypePerDivision(divisions, CardType.REACTION)
         totalReactions = 0
         for reactions in availableReactionsPerDivision
            totalReactions += reactions.length

         if totalReactions < 1
            return false

         divisionContainingCard = @getDivisionContainingCard(divisions, card)
 
         for division, divisionIndex in divisions
            if division == divisionContainingCard
               if (division.getUnfilledCount() >= 2 and
                     availableReactionsPerDivision[divisionIndex] > 0)
                  # Allow the attack because the division with the attack also has available
                  # reactions and enough spots for one.
                  debugger
                  console.log("attack allowed because of same division having reaction")
                  return true 
            else 
               if !division.isFilled() and availableReactionsPerDivision[divisionIndex] > 0
                  # Another division is unfilled with available reactions.
                  debugger
                  console.log("attack allowed because another division has reaction")
                  return true

         # There are no unfilled spots for the reaction.
         return false

      correctDivisions: (divisions) ->
         lockedCards = @getLockedCards(divisions)
         lockedCardsHasAttack = 
               !!lockedCards.filter(CardUtil.filterByRequiredType(CardType.ATTACK)).length
         hasAvailableReactions = @hasAvailableReactions(divisions)

         if lockedCardsHasAttack and hasAvailableReactions
            return @lockRandomCardOfType(divisions, CardType.REACTION)

         if lockedCardsHasAttack and !hasAvailableReactions
            throw Error('Attack is locked but no reactions available.')

         if !hasAvailableReactions
            return @removeAttacksFromAvailableCards(divisions)

         if !@checkIfAttacksShouldBeIncluded(divisions)
            return @removeAttacksFromAvailableCards(divisions)

         divisions = @lockRandomCardOfType(divisions, CardType.REACTION)
         divisions = @lockRandomCardOfType(divisions, CardType.ATTACK)
         return divisions

      removeAttacksFromAvailableCards: (divisions) ->
         newDivisions = []
         for division in divisions
            availableCards = division.getAvailableCards()
            attackCards = availableCards.filter(CardUtil.filterByRequiredType(CardType.ATTACK))
            newDivisions.push(
                  division.createDivisionByRemovingCards(CardUtil.extractIds(attackCards)))
         return newDivisions

      checkIfAttacksShouldBeIncluded: (divisions) ->
         divisions = @lockRandomCardOfType(divisions, CardType.REACTION)
         filledDivisions = @fillDivisions(divisions)
         cards = @getLockedAndSelectedCards(filledDivisions)
         return cards.filter(CardUtil.filterByRequiredType(CardType.ATTACK)).length > 0

      fillDivisions: (divisions) ->
         results = []
         for division in divisions
            while not division.isFilled()
               selectedCard = @getRandomCard(division.getAvailableCards())
               division = division.createDivisionBySelectingCard(selectedCard.id)
            results.push(division)
         return results

      lockRandomCardOfType: (divisions, cardType) ->
         divisions = divisions.concat()
         availableCardsPerDivision =
               SupplyDivisions.getAvailableCardsOfTypePerDivision(divisions, cardType)
         counts = []
         for cards in availableCardsPerDivision
            counts.push(cards.length)
         segmentedRange = new SegmentedRange(0, counts)
         divisionIndex = segmentedRange.getRandomSegmentIndex()
         cardToLock = @getRandomCard(availableCardsPerDivision[divisionIndex])
         divisions[divisionIndex] =
               divisions[divisionIndex].createDivisionByLockingCard(cardToLock.id)
         return divisions

      hasAvailableReactions: (divisions) ->
         availableReactions = SupplyDivisions.getAvailableCardsOfType(divisions, CardType.REACTION)
         return !!reactions.length

      getLockedAndSelectedCards: (divisions) ->
         cards = []
         for division in divisions
            cards = cards.concat(division.getLockedAndSelectedCards())
         return cards

      getLockedCards: (divisions) ->
         cards = []
         for division in divisions
            cards = cards.concat(division.getLockedCards())
         return cards

      getDivisionContainingCard: (divisions, card) ->
         for division in divisions
            allCards = division.getLockedAndSelectedCards().concat(division.getAvailableCards())
            if allCards.filter(CardUtil.filterByIncludedIds([card.id])).length
               return division
         throw Error("Card not found in any of the divisions: #{card.id}")

      getRandomCard: (cards) ->
         return cards[RandUtil.getRandomInt(0, cards.length)]

      hasReaction: (cards) ->
         return !!cards.filter(CardUtil.filterByRequiredType(CardType.REACTION)).length


   window.ReactionSupplyCorrection = ReactionSupplyCorrection
