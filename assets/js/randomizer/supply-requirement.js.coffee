do ->

   class SupplyRequirement
      constructor: ->

      isSatisfied: (divisions) ->
         for division in divisions
            if @getSatisfyingCards(division.getLockedAndSelectedCards()).length
               return true
         return false

      getSatisfyingCardsFromDivisions: (divisions) ->
         satisfyingCards = []
         for division in divisions
            satisfyingCards =
                  satisfyingCards.concat(@getSatisfyingCards(division.getAvailableCards()))
         return satisfyingCards

      getSatisfyingCards: (cards) ->
         throw Error('Not implemented.')


   window.SupplyRequirement = SupplyRequirement
