#= require randomizer/util.js.coffee

do ->
   Util = window.Util

   serializeKingdom = (kingdom, metadata) ->
      result = []
      result.push(serializeCards(kingdom.cards))
      result.push(serializeEvents(kingdom.events)) if kingdom.events?.length
      result.push(serializeEvents(kingdom.landmarks)) if kingdom.landmarks?.length

      serializedMetadata = serializeMetadata(metadata)
      result.push(serializedMetadata) if serializedMetadata.length
      return result.join('&')

   deserializeKingdom = (allSets, serializedKingdom) -> 
      cardIds = parseNamedCommaSeparatedParameter('cards', serializedKingdom) or []
      eventIds = parseNamedCommaSeparatedParameter('events', serializedKingdom) or []
      landmarkIds = parseNamedCommaSeparatedParameter('landmarks', serializedKingdom) or []
      useShelters = parseNamedBooleanParameter('shelters', serializedKingdom)
      useColonies = parseNamedBooleanParameter('colonies', serializedKingdom)

      allCards = Util.flattenSetsForProperty(allSets, 'cards')
      allEvents = Util.flattenSetsForProperty(allSets, 'events')
      allLandmarks = Util.flattenSetsForProperty(allSets, 'landmarks')

      cards = findByIds(cardIds, allCards).slice(0, 10)
      events = findByIds(eventIds, allEvents).slice(0, 2)
      landmarks = findByIds(landmarkIds, allLandmarks).slice(0, 2 - events.length)

      return {
         kingdom: {
            cards: cards
            events: events
            landmarks: landmarks
         }
         metadata: {
            useColonies: parseNamedBooleanParameter('colonies', serializedKingdom)
            useShelters: parseNamedBooleanParameter('shelters', serializedKingdom)
         }
      }

   serializeCards = (cards) ->
      sortedCards = cards.concat().sort (a, b) ->
         return 1 if a.shortId > b.shortId
         return -1 if a.shortId < b.shortId
         return 0

      return "cards=#{serializeCardsWithShortIds(sortedCards)}"

   serializeEvents = (events) ->
      return "events=#{serializeCardsWithShortIds(events)}"

   serializeLandmarks = (landmarks) ->
      return "landmarks=#{serializeCardsWithShortIds(landmarks)}"

   serializeCardsWithShortIds = (cards) ->
      return '' unless cards.length
      ids = (card.shortId for card in cards)
      return ids.join(',')

   serializeMetadata = (metadata) ->
      result = []
      if metadata.useColonies
         result.push('colonies=1')
      if metadata.useShelters
         result.push('shelters=1')
      return result.join('&')

   findByIds = (cardIds, cards) ->
      foundCards = []
      for cardId in cardIds
         foundCard = findById(cardId, cards)
         foundCards.push(foundCard) if foundCard
      return foundCards

   findById = (cardId, cards) ->
      for card in cards
         if card.id == cardId || card.shortId == cardId
            return card
      return null

   parseNamedCommaSeparatedParameter = (parameter, serializedKingdom) ->
      value = parseNamedParameter(parameter, serializedKingdom)
      return null unless value
      return value.split(',')

   parseNamedBooleanParameter = (parameter, serializedKingdom) ->
      value = parseNamedParameter(parameter, serializedKingdom)
      return  value == '1' || value == 'true'

   parseNamedParameter = (parameter, serializedKingdom) ->
      regex = new RegExp("#{parameter}=([\\w,]+)")
      matches = regex.exec(serializedKingdom)
      return null unless matches?[1]
      return matches[1]


   window.Serializer = {
      serializeKingdom: serializeKingdom
      deserializeKingdom: deserializeKingdom
   }
