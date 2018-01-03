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
      constructor: (builder, prioritizedSetId, numberOfAlchemyCardsInUse,
               numberOfHighCostCardsInUse) ->
         @builder = builder
         @prioritizedSetId = prioritizedSetId
         @numberOfAlchemyCardsInUse = numberOfAlchemyCardsInUse
         @numberOfHighCostCardsInUse = numberOfHighCostCardsInUse
      
      getBuilder: ->
         return @builder

      getPrioritizedSetId: ->
         return @prioritizedSetId

      getNumberOfAlchemyCardsInUse: ->
         return @numberOfAlchemyCardsInUse

      getNumberOfHighCostCardsInUse: ->
         return @numberOfHighCostCardsInUse


   window.Supply = Supply
   window.Supply.Metadata = Metadata