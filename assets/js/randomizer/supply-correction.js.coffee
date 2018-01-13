do ->

   class SupplyCorrection
      constructor: ->

      isSatisfied: (divisions) ->
         throw Error('Not implemented.')

      allowLockedCard: (divisions, card) ->
         return true

      correctDivisions: (divisions) ->
         throw Error('Not implemented.')


   window.SupplyCorrection = SupplyCorrection
