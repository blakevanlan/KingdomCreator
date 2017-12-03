do ->
   DominionSets = window.DominionSets
   DominionKingdoms = window.DominionKingdoms

   getSetIdFromObject = (obj) ->
      id = if typeof obj == 'string' then obj else obj.id
      return if id.indexOf('_') > 0 then id.split('_')[0] else id

   getSetById = (setId) ->
      return DominionSets[setId]

   getCardById = (cardId) ->
      throw Error('Missing card id.') unless cardId

      idParts = cardId.split('_')
      setId = idParts[0]
      set = getSetById(setId)
      if idParts.length == 3 and idParts[1] == 'event'
         for event in set.events
            if event.id == cardId
               return event
         throw Error('Unknown card id: ' + cardId)

      if idParts.length == 3 and idParts[1] == 'landmark'
         for landmark in set.landmarks
            if landmark.id == cardId
               return landmark
         throw Error('Unknown card id: ' + cardId)

      if idPars.length == 3 and idParts[1] == 'boon'
         for boon in set.boons
            if boon.id == cardId
               return boon
         throw Error('Unknown card id: ' + cardId)

      for card in set.cards
         if card.id == cardId
            return card

      throw Error('Unknown card id: ' + cardId)


   window.Querier = {
      getSetIdFromObject: getSetIdFromObject
      getSetById: getSetById
      getCardById: getCardById
   }