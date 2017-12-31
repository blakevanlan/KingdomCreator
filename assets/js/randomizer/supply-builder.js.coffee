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

      createSupply: (existingCards) ->
         divisions = [new SupplyDivision(@cards, [], [], 10)]
         divisions = @applyDividers(divisions)
         divisions = @applyExistingCards(divisions, existingCards)
         divisions = @applyBans(divisions)
         divisions = @applyRequirements(divisions)
         divisions = @fillDivisions(divisions)
         divisions = @correctDivisions(divisions)
         return @gatherCards(divisions)

      applyBans: (divisions) ->
         divisions = divisions.concat()
         for ban in @bans
            for division, index in divisions
               bannedCards = ban.getBannedCards(division.getAvailableCards())
               divisions[index] = 
                     division.createDivisionByRemovingCards(CardUtil.extractIds(bannedCards))
         return divisions

      applyRequirements: (divisions) ->
         divisions = divisions.concat()
         for requirement in @requirements
            if requirement.isSatisfied(divisions)
               continue

            segmentedRange = @getSegmentedRangeForRequirement(requirement, divisions)
            if not segmentedRange.getLength()
               throw Error("Unable to satisfy requirement: #{requirement}.")

            # Select a random division to lock in a required card.
            divisionIndex = segmentedRange.getRandomSegmentIndex()
            cards = requirement.getSatisfyingCardsFromDivisions([divisions[divisionIndex]])
            selectedCard = @selectRandomCard(cards)
            divisions[divisionIndex] = 
                  divisions[divisionIndex].createDivisionByLockingCard(selectedCard.id)
         return divisions

      applyDividers: (divisions) ->
         for divider in @dividers 
            divisions = divider.subdivideDivisions(divisions)
         return divisions

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

      correctDivisions: (divisions) ->
         for correction in @corrections 
            if not correction.isSatisfied(divisions)
               divisions = correction.correctDivisions(divisions)
         return divisions

      gatherCards: (divisions) ->
         cards = []
         for division in divisions 
            cards = cards.concat(division.getLockedAndSelectedCards())
         return cards

      getSegmentedRangeForRequirement: (requirement, divisions) ->
         lengths = []
         for division in divisions
            lengths.push(requirement.getSatisfyingCardsFromDivisions([division]).length)
         return new SegmentedRange(0, lengths)

      findIndexOfDivisionContainingCardId: (divisions, cardId) ->
         for division, divisionIndex in divisions
            # Each card should only fit within a single division.
            if (!division.isFilled() and
                  CardUtil.findCardById(division.getAvailableCards(), existingCard.id))
               return division
         return -1

      getIndexOfDivisionWithMostUnfilledCards: (divisions) ->
         mostUnfilledCards = 0
         winningIndex = -1
         for division, index in divisions
            if division.getUnfilledCount() > mostUnfilledCards
               winningIndex = index
         return winningIndex

      selectRandomCard: (cards) ->
         return cards[RandUtil.getRandomInt(0, cards.length)]


   window.SupplyBuilder = SupplyBuilder
