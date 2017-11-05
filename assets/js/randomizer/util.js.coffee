do -> 

   flattenSetsForProperty = (sets, property) ->
      cards = []
      for setId, set of sets
         if set[property]
            for card in set[property]
               cards.push(card)
      return cards


   window.Util = {
      flattenSetsForProperty: flattenSetsForProperty
   }