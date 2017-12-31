do -> 

   class Supply
      constructor: (cards, metadata) ->
         @cards = cards
         @metadata = metadata

      getCards: ->
         return @cards

      getMetadata: ->
         return @metadata

   class Metadata
      constructor: (prioritizedSetId, numberOfAlchemyCardsInUse, numberOfHighCostCardsInUse) ->
         @prioritizedSetId = prioritizedSetId
         @numberOfAlchemyCardsInUse = numberOfAlchemyCardsInUse
         @numberOfHighCostCardsInUse = numberOfHighCostCardsInUse

      getPrioritizedSetId: ->
         return @prioritizedSetId

      getNumberOfAlchemyCardsInUse: ->
         return @numberOfAlchemyCardsInUse

      getNumberOfHighCostCardsInUse: ->
         return @numberOfHighCostCardsInUse


   window.Supply = Supply
   window.Supply.Metadata = Metadata