#= require randomizer/supply-correction.js.coffee
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

   class ReactionSupplyCorrection extends SupplyCorrection
      isSatisfied: (divisions) ->
         selectedCards = @getLockedAndSelectedCards(divisions)
         hasAttacks = !!selectedCards.filter(CardUtil.filterByRequiredType(CardType.ATTACK)).length
         hasReaction = !!selectedCards.filter(CardUtil.filterByRequiredType(CardType.REACTION)).length
         return !hasAttacks || hasReaction

      correctDivisions: (divisions) ->
         divisions = divisions.concat()
         selectedCards = @getSelectedCards(divisions)
         if not selectedCards.length 
            throw Error('Unable to correct set. No cards can be changed.')

         lockedCards = @getLockedCards(divisions)
         lockedCardsHasAttack = 
               !!lockedCards.filter(CardUtil.filterByRequiredType(CardType.ATTACK)).length
         hasAvailableReactions = @hasAvailableReactions(divisions)

         if lockedCardsHasAttack and hasAvailableReactions
            return @correctDivisionsUsingSelectedCards(divisions)

         if lockedCardsHasAttack and !hasAvailableReactions
            throw Error('Attack is locked but no reactions available.')

         # Replace the attack cards instead if there are no available reactions.
         if !hasAvailableReactions
            return @correctDivisionsByReplacingAttacks()

         # Validate that there are at least 2 non-locked cards - one for the attack, one for the
         # reaction.
         if selectedCards.length < 2
            throw Error('Unable to correct set. Attack card is only card that can be changed.')

         # Lock one of the selected attack cards so it isn't inadvertently replaced.
         segmentedRange =
               new SegmentedRange(0, @getSelectedCardsPerDivision(divisions, CardType.ATTACK))
         divisionIndex = segmentedRange.getRandomSegmentIndex()
         division = divisions[divisionIndex]
         cardToLock = @getRandomCard(
               division.getSelectedCards().filter(CardUtil.filterByRequiredType(CardType.ATTACK)))
         divisions[divisionIndex] = division.createDivisionByLockingCard(cardToLock.id)
         return @correctDivisionsUsingSelectedCards(divisions)

      correctDivisionsUsingSelectedCards: (divisions) ->
         reactionCounts = @getAvailableReactionsPerDivision(divisions)
         segmentedRange = new SegmentedRange(0, reactionCounts)
         divisionIndex = segmentedRange.getRandomSegmentIndex()
         division = divisions[divisionIndex]
         availableReactions =
               division.getAvailableCards().filter(CardUtil.filterByRequiredType(CardType.REACTION))
         cardToLock = @getRandomCard(availableReactions)
         cardToRemove = @getRandomCard(division.getSelectedCards())
         
         divisions = divisions.concat()
         divisions[divisionIndex] = 
               division
                     .createDivisionByRemovingCards([cardToRemove.id])
                     .createDivisionByLockingCard(cardToLock.id)
         return divisions

      correctDivisionsByReplacingAttacks: (divisions) ->
         divisions = divisions.concat()
         for division, divisionIndex in divisions
            selectedCards = division.getSelectedCards()
            selectedAttacks = selectedCards.filter(CardUtil.filterByRequiredType(CardType.ATTACK))
            availableCards = division.getAvailableCards()
                  .filter(CardUtil.filterByExcludedTypes([CardType.ATTACK]))
            if availableCards.length < selectedAttacks.length
               throw Error('No reactions and not enough available cards to replace attacks.')

            # Replace each attack card.
            for selectedAttack in selectedAttacks
               division = division.createDivisionByRemovingCards([selectedAttack.id])
               division = division.createDivisionByLockingCard(
                     @getRandomCard(division.getAvailableCards()).id)
            divisions[divisionIndex] = division

         return divisions 

      getSelectedCardsPerDivision: (divisions, cardType) ->
         counts = []
         for division, index in divisions
            selectedCards = division.getSelectedCards()
            counts[index] =
                  selectedCards.filter(CardUtil.filterByRequiredType(cardType)).length
         return counts

      getAvailableCardsPerDivision: (divisions, cardType) ->
         counts = []
         for division, index in divisions
            availableCards = division.getAvailableCards()
            counts[index] =
                  availableCards.filter(CardUtil.filterByRequiredType(cardType)).length
         return counts

      hasAvailableReactions: (divisions) ->
         availableReactionsPerDivision = @getAvailableReactionsPerDivision(divisions)
         sum = 0
         for count in availableReactionsPerDivision
            sum += count
         return sum > 0

      getAvailableReactionsPerDivision: (divisions) ->
         counts = []
         for division, index in divisions
            if division.getSelectedCards().length or !division.isFilled()
               availableCards = division.getAvailableCards()
               counts[index] =
                     availableCards.filter(CardUtil.filterByRequiredType(CardType.REACTION)).length
            else
               counts[index] = 0
         return counts

         availableReactions =
            availableCards.filter(CardUtil.filterByRequiredType(CardType.REACTION))

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

      getSelectedCards: (divisions) ->
         cards = []
         for division in divisions
            cards = cards.concat(division.getSelectedCards())
         return cards

      getRandomCard: (cards) ->
         return cards[RandUtil.getRandomInt(0, cards.length)]


   window.ReactionSupplyCorrection = ReactionSupplyCorrection
