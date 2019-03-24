#= require utils/card-util.js.coffee
#= require utils/rand-util.js.coffee

do ->
   CardUtil = window.CardUtil
   RandUtil = window.RandUtil

   class SupplyBuilder
      constructor: (cards) ->
         @cards = cards
         @dividers = []
         @requirements = []
         @bans = []
         @corrections = []

      addDivider: (divider) ->
         @dividers.push(divider)

      addRequirement: (requirement) ->
         @requirements.push(requirement)

      addBan: (ban) ->
         @bans.push(ban)

      addCorrection: (correction) ->
         @corrections.push(correction)

      createUnfilledDivisions: (existingCards) -> 
         division = new SupplyDivision(@cards, [], [], 10)
         division = @prepareDivisionForBanning(division, existingCards)
         division = @applyBans(division)
         division = @addExistingCardsAsAvailable(division, existingCards)
         divisions = @applyDividers([division])
         divisions = @applyExistingCards(divisions, existingCards)
         return divisions

      createSupply: (existingCards) ->
         divisions = @createUnfilledDivisions(existingCards)
         divisions = @applyRequirements(divisions)
         divisions = @applyCorrections(divisions)
         divisions = @fillDivisions(divisions)
         return @gatherCards(divisions)

      clone: () ->
         clone = new SupplyBuilder()
         clone.cards = @cards
         clone.dividers = @dividers
         clone.requirements = @requirements
         clone.bans = @bans 
         clone.corrections = @corrections
         return clone

      ### Private methods ###

      prepareDivisionForBanning: (division, existingCards) ->
         # Prepare the division for banning by reducing the number of cards needed in the division
         # to account for the existing cards that will be added after banning.
         return division.createDivisionWithTotalCount(
            division.getTotalCount() - existingCards.length)

      applyBans: (division) ->
         for ban in @bans
            bannedCards = ban.getBannedCards(division.getAvailableCards())
            division = division.createDivisionByRemovingCards(CardUtil.extractIds(bannedCards))
         return division

      applyRequirements: (divisions) ->
         divisions = divisions.concat()
         orderedRequirements = @orderRequirementsForDivisions(divisions)
         for requirement in orderedRequirements
            if requirement.isSatisfied(divisions)
               continue

            segmentedRange = @getSegmentedRangeForRequirement(requirement, divisions)
            if not segmentedRange.getLength()
               throw Error("Unable to satisfy requirement: #{requirement}.")

            # Select a random division to lock in a required card.
            divisionIndex = segmentedRange.getRandomSegmentIndex()
            cards = requirement.getSatisfyingCardsFromDivisions([divisions[divisionIndex]])
            while cards.length
               randomIndex = RandUtil.getRandomInt(0, cards.length)
               selectedCard = cards[randomIndex]

               # Check if the selected card is allowed by the corrections.
               if @allowLockedCard(divisions, selectedCard)
                  divisions[divisionIndex] = 
                        divisions[divisionIndex].createDivisionByLockingCard(selectedCard.id)
                  break

               # Remove the card that wasn't allowed from the available cards.
               cards.splice(randomIndex, 1)

            if !cards.length
               throw Error("Unable to satisfy requirement: #{requirement}.")

         return divisions

      applyDividers: (divisions) ->
         for divider in @dividers 
            divisions = divider.subdivideDivisions(divisions)
         return divisions

      addExistingCardsAsAvailable: (division, existingCards) ->
         # Add the existing cards as available to allow divisions to be intelligently divided. 
         availableCardIds = CardUtil.extractIds(division.getAvailableCards())
         cardsToAdd = []
         for card in existingCards
            if availableCardIds.indexOf(card.id) == -1
               cardsToAdd.push(card)

         # Reinflate the total number of cards in the division by the number of existing cards since
         # the total was reduced in preparation for banning. See #prepareDivisionForBanning.
         return new SupplyDivision(
               division.getAvailableCards().concat(cardsToAdd), division.getLockedCards(),
               division.getSelectedCards(), division.getTotalCount() + existingCards.length)

      applyExistingCards: (divisions, existingCards) ->
         divisions = divisions.concat()

         cardsForNewDivision = []
         for existingCard in existingCards
            divisionIndex = @findIndexOfDivisionContainingCardId(divisions, existingCard.id)
            if divisionIndex == -1
               # Collect cards that cannot be fit into a division and apply them afterwards.
               cardsForNewDivision.push(existingCard)
            else
               division = divisions[divisionIndex]
               divisions[divisionIndex] = division.createDivisionByLockingCard(existingCard.id)

         if not cardsForNewDivision.length
            return divisions

         # Shrink divisions with the most space to make room for the new division.
         for existingCard in cardsForNewDivision
            divisionIndex = @getIndexOfDivisionWithMostUnfilledCards(divisions)
            division = divisions[divisionIndex]
            divisions[divisionIndex] = new SupplyDivision(division.getAvailableCards(),
                  division.getLockedCards(), division.getSelectedCards(),
                  division.getTotalCount() - 1)

         divisions.push(new SupplyDivision([], cardsForNewDivision, [], cardsForNewDivision.length))
         return divisions

      fillDivisions: (divisions) ->
         results = []
         for division in divisions
            while not division.isFilled()
               selectedCard = @selectRandomCard(division.getAvailableCards())
               division = division.createDivisionBySelectingCard(selectedCard.id)
            results.push(division)
         return results

      applyCorrections: (divisions) ->
         for correction in @corrections 
            if not correction.isSatisfied(divisions)
               divisions = correction.correctDivisions(divisions)
         return divisions

      gatherCards: (divisions) ->
         cards = []
         for division in divisions 
            cards = cards.concat(division.getLockedAndSelectedCards())
         return cards

      orderRequirementsForDivisions: (divisions) ->
         satsifiedRequirements = []
         requirementAndCountPairs = []
         for requirement, index in @requirements
            if requirement.isSatisfied(divisions)
               satsifiedRequirements.push(requirement)
               continue

            requirementAndCountPairs.push({
               requirement: requirement,
               count: requirement.getSatisfyingCardsFromDivisions(divisions)
            })
         
         requirementAndCountPairs.sort (a, b) ->
            return -1 if a.count < b.count
            return 1 if a.count > b.count
            return 0

         ordered = []
         for pair in requirementAndCountPairs
            ordered.push(pair.requirement)
         return satsifiedRequirements.concat(ordered)

      getSegmentedRangeForRequirement: (requirement, divisions) ->
         lengths = []
         for division in divisions
            if division.isFilled()
               lengths.push(0)
            else
               lengths.push(requirement.getSatisfyingCardsFromDivisions([division]).length)
         return new SegmentedRange(0, lengths)

      findIndexOfDivisionContainingCardId: (divisions, cardId) ->
         for division, divisionIndex in divisions
            # Each card should only fit within a single division.
            if (!division.isFilled() and
                  CardUtil.findCardById(division.getAvailableCards(), cardId))
               return divisionIndex
         return -1

      getIndexOfDivisionWithMostUnfilledCards: (divisions) ->
         mostUnfilledCards = 0
         winningIndex = -1
         for division, index in divisions
            if division.getUnfilledCount() > mostUnfilledCards
               winningIndex = index
         return winningIndex

      allowLockedCard: (divisions, card) ->
         for correction in @corrections 
            if not correction.allowLockedCard(divisions, card)
               return false
         return true 

      selectRandomCard: (cards) ->
         return cards[RandUtil.getRandomInt(0, cards.length)]


   window.SupplyBuilder = SupplyBuilder
