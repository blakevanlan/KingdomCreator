#= require randomizer/rand-util.js.coffee

do ->
   RandUtil = window.RandUtil

   ALCHEMY_SET_ID = 'alchemy'
   DARK_AGES_SET_ID = 'darkages'
   PROSPERITY_SET_ID = 'prosperity'

   Type = {
      ACTION: 'isAction',
      ACTION_SUPPLIER: 'isActionSupplier',
      ATTACK: 'isAttack',
      BUY_SUPPLIER: 'isBuySupplier',
      DRAWER: 'isDrawer',
      DURATION: 'isDuration',
      REACTION: 'isReaction',
      RESERVE: 'isReserve',
      TRASHING: 'isTrashing',
      TREASURE: 'isTreasure',
      VICTORY: 'isVictory',
   }

   Cost = {
      TREASURE_2: 'treasure2',
      TREASURE_3: 'treasure3',
      TREASURE_4: 'treasure4',
      TREASURE_5: 'treasure5',
      TREASURE_6: 'treasure6',
      TREASURE_7: 'treasure7',
      TREASURE_8: 'treasure8'
   }

   NUM_CARDS_IN_KINGDOM = 10

   MIN_ALCHEMY_CARDS_IN_KINGDOM = 3
   MAX_ALCHEMY_CARDS_IN_KINGDOM = 5
   MAX_EVENTS_AND_LANDMARKS_IN_KINGDOM = 2

   createKingdom = (allSets, options) ->
      allCards = flattenSetsForProperty(allSets, 'cards')
      allEvents = flattenSetsForProperty(allSets, 'events')
      allLandmarks = flattenSetsForProperty(allSets, 'landmarks')

      # Extract options and set defaults.
      options = options or {}
      setIds = options.setIds or (setId for setId, set of allSets)
      includeCardIds = options.includeCardIds or []
      excludeCardIds = options.excludeCardIds or []
      includeEventIds = options.includeEventIds or []
      excludeEventIds = options.excludeEventIds or []
      includeLandmarkIds = options.includeLandmarkIds or []
      excludeLandmarkIds = options.excludeLandmarkIds or []
      excludeTypes = options.excludeTypes or []
      allowedTypes = options.allowedTypes or (value for type, value of Type)
      allowedCosts = options.allowedCosts or (value for cost, value of Cost)
      requireActionProvider = !!options.requireActionProvider
      requireBuyProvider = !!options.requireBuyProvider
      requireReactionIfAttackCards = !!options.requireReactionIfAttackCards
      eventIdsToReplace = options.eventIdsToReplace or []
      landmarkIdsToReplace = options.landmarkIdsToReplace or []
      fillKingdomEventsAndLandmarks = !!options.fillKingdomEventsAndLandmarks

      # Fill the kingdom with included cards.
      kingdom = {
         cards: allCards.filter(filterByIncludedIds(includeCardIds)),
         events: allEvents.filter(filterByIncludedIds(includeEventIds)),
         landmarks: allLandmarks.filter(filterByIncludedIds(includeLandmarkIds)),
      }
      setsToUse = filterSetsByAllowedSetIds(allSets, setIds)
      
      # Check if alchemy should be excluded. This is because it's only recommend to play with
      # alchemy if 3-5 alchemy cards are used.
      useAlchemy = shouldUseAlchemyForKingdom(kingdom)
      if not useAlchemy
         setsToUse = filterSetsByExcludedSetIds(setsToUse, [ALCHEMY_SET_ID])

      # Filter down to the set of useable cards.
      cardsToUse = flattenSetsForProperty(setsToUse, 'cards')
      cardsToUse = cardsToUse.filter(filterByExcludedIds(includeCardIds))
      cardsToUse = cardsToUse.filter(filterByExcludedIds(excludeCardIds))
      cardsToUse = cardsToUse.filter(filterByExcludedTypes(excludeTypes))
      cardsToUse = cardsToUse.filter(filterByAllowedTypes(allowedTypes))
      cardsToUse = cardsToUse.filter(filterByAllowedCost(allowedCosts))

      eventsToUse = flattenSetsForProperty(setsToUse, 'events')
      eventsToUse = eventsToUse.filter(filterByExcludedIds(includeEventIds))
      eventsToUse = eventsToUse.filter(filterByExcludedIds(excludeEventIds))

      landmarksToUse = flattenSetsForProperty(setsToUse, 'landmarks')
      landmarksToUse = landmarksToUse.filter(filterByExcludedIds(includeLandmarkIds))
      landmarksToUse = landmarksToUse.filter(filterByExcludedIds(excludeLandmarkIds))

      unless cardsToUse.length
         console.log('No cards to use!')
         return null

      # Replace the event and landmarks cards.
      if eventIdsToReplace.length or landmarkIdsToReplace.length
         # Remove the events and landmarks that are being replaced.
         eventsToUse = eventsToUse.filter(filterByExcludedIds(eventIdsToReplace))
         kingdom.events = kingdom.events.filter(filterByExcludedIds(eventIdsToReplace))
         landmarksToUse = landmarksToUse.filter(filterByExcludedIds(landmarkIdsToReplace))
         kingdom.landmarks = kingdom.landmarks.filter(filterByExcludedIds(landmarkIdsToReplace))

         numberOfNewCards = eventIdsToReplace.length + landmarkIdsToReplace.length
         newCards = selectRandomCards(eventsToUse.concat(landmarksToUse), numberOfNewCards)

         kingdom.events = kingdom.events.concat(
            eventsToUse.filter(filterByIncludedIds(extractIds(newCards))))
         kingdom.landmarks = kingdom.landmarks.concat(
            landmarksToUse.filter(filterByIncludedIds(extractIds(newCards))))

      # Replace given landmark cards.
      if landmarkIdsToReplace.length
         kingdom.landmarks = kingdom.landmarks.concat(selectRandomCards(landmarksToUse, landmarkIdsToReplace.length))

      # Fill the kingdom with cards and remove those cards from the usable set.
      eventsToUseForKingdom = if fillKingdomEventsAndLandmarks then eventsToUse else []
      landmarksToUseForKingdom = if fillKingdomEventsAndLandmarks then landmarksToUse else []
      kingdom = fillKingdom(kingdom, cardsToUse, eventsToUseForKingdom, landmarksToUseForKingdom)
      cardsToUse = cardsToUse.filter(filterByExcludedIds(extractIds(kingdom.cards)))

      # Adjust kingdom to have 3-5 alchemy cards if alchemy is being used.
      if useAlchemy
         kingdom = adjustKingdomForAlchemyCards(kingdom, cardsToUse, includeCardIds, excludeCardIds)

      if requireActionProvider
         result = adjustKingdomToIncludeType(Type.ACTION_SUPPLIER, kingdom, cardsToUse, includeCardIds)
         kingdom = result.kingdom
         cardsToUse.push(result.oldCard) if result.oldCard
         if result.newCard
            cardsToUse = cardsToUse.filter(filterByExcludedIds([result.newCard.id]))
            includeCardIds.push(result.newCard.id)

      if requireBuyProvider
         result = adjustKingdomToIncludeType(Type.BUY_SUPPLIER, kingdom, cardsToUse, includeCardIds)
         kingdom = result.kingdom
         cardsToUse.push(result.oldCard) if result.oldCard
         if result.newCard
            cardsToUse = cardsToUse.filter(filterByExcludedIds([result.newCard.id]))
            includeCardIds.push(result.newCard)

      if requireReactionIfAttackCards
         attackCards = kingdom.cards.filter(filterByAllowedTypes([Type.ATTACK]))
         if attackCards.length
            requiredAttackCards = attackCards.filter(filterByIncludedIds(includeCardIds))
            if requiredAttackCards.length < 1 and includeCardIds.length < NUM_CARDS_IN_KINGDOM - 1
               # Randomly pick an attack card to make required since a card will be exchanged to
               # make room for a reaction card.
               includeCardIds.push(selectRandomCards(attackCards, 1)[0].id)
            result = adjustKingdomToIncludeType(Type.REACTION, kingdom, cardsToUse, includeCardIds)
            kingdom = result.kingdom

      return {
         kingdom: kingdom
         metadata: {
            useColonies: shouldUseSpecialtyCardFromSet(PROSPERITY_SET_ID, setsToUse)
            useShelters: shouldUseSpecialtyCardFromSet(DARK_AGES_SET_ID, setsToUse)
         }
      }

   adjustKingdomForAlchemyCards = (kingdom, cardsToUse, requiredCardIds, excludeCardIds) ->      
      alchemyCards = kingdom.cards.filter(filterByIncludedSetIds([ALCHEMY_SET_ID]))
      if alchemyCards.length == 0
         # Return the existing kingdom if no alchemy cards were randomly selected.
         return kingdom

      # Check if the kingdom needs to be readjusted to have 3-5 alchemy cards in the kingdom.
      if MIN_ALCHEMY_CARDS_IN_KINGDOM <= alchemyCards.length <= MAX_ALCHEMY_CARDS_IN_KINGDOM
         return kingdom

      replaceableCards = kingdom.cards.filter(filterByExcludedIds(requiredCardIds))
      replaceableCards = replaceableCards.filter(filterByExcludedSetIds([ALCHEMY_SET_ID]))
      numberOfAlchemyCardsToUse = 
         RandUtil.getRandomInt(MIN_ALCHEMY_CARDS_IN_KINGDOM, MAX_ALCHEMY_CARDS_IN_KINGDOM + 1)
      
      # Calculate the number of new alchemy cards, bounded by the number of cards that can be
      # swapped out.
      numberOfNewAlchemyCards =
            Math.min(numberOfAlchemyCardsToUse - alchemyCards.length, replaceableCards.length)
      if numberOfNewAlchemyCards <= 0
         return kingdom

      # Combine the required cards and the alchemy cards.
      cards = kingdom.cards.filter(filterByIncludedIds(requiredCardIds))
      cards = unionCards(cards, alchemyCards)

      # Added the additional alchemy cards.
      possibleAlchemyCards = cardsToUse.filter(filterByIncludedSetIds([ALCHEMY_SET_ID]))
      cards = cards.concat(selectRandomCards(possibleAlchemyCards, numberOfNewAlchemyCards))
      
      # Added the cards that weren't required but were kept anyways.
      kingdom.cards = cards.concat(
            selectRandomCards(replaceableCards, replaceableCards.length - numberOfNewAlchemyCards))

      return kingdom

   adjustKingdomToIncludeType = (type, kingdom, cardsToUse, requiredCardIds) ->
      existingCardsOfType = kingdom.cards.filter(filterByAllowedTypes([type]))
      # Ensure that there is at least one action provider in the kingdom.
      if existingCardsOfType.length >= 1
         return {kingdom: kingdom, newCard: null, oldCard: null}

      replaceableCards = kingdom.cards.filter(filterByExcludedIds(requiredCardIds))
      if replaceableCards.length < 1
         return {kingdom: kingdom, newCard: null, oldCard: null}

      cardsToBeReplaced = selectRandomCards(replaceableCards, 1)
      cardsOfTypes = cardsToUse.filter(filterByAllowedTypes([type]))
      newCardsOfType = selectRandomCards(cardsOfTypes, 1)

      cards = kingdom.cards.filter(filterByExcludedIds(extractIds(cardsToBeReplaced)))
      kingdom.cards = cards.concat(newCardsOfType)
      return {kingdom: kingdom, newCard: newCardsOfType[0], oldCard: cardsToBeReplaced[0]}

   shouldUseSpecialtyCardFromSet = (setId, setsBeingUsed) ->
      index = extractIds(setsBeingUsed).indexOf(setId)
      return false if index == -1
      numberOfSpecialtySetCards = setsBeingUsed[index].cards.length
      numberOfCardsBeingUsed = 0
      for set in setsBeingUsed
         numberOfCardsBeingUsed += set.cards.length
      index = RandUtil.getRandomInt(0, numberOfCardsBeingUsed)
      return index < numberOfSpecialtySetCards

   fillKingdom = (kingdom, cardsToUse, eventsToUse, landmarksToUse) ->
      while kingdom.cards.length < NUM_CARDS_IN_KINGDOM
         numberOfCards = cardsToUse.length + eventsToUse.length + landmarksToUse.length
         index = RandUtil.getRandomInt(0, numberOfCards)

         # Check if the selected index is a card.
         if index < cardsToUse.length
            card = cardsToUse[index]
            kingdom.cards.push(card)
            cardsToUse = cardsToUse.filter(filterByExcludedIds([card.id]))
            continue

         # Check if there are already too many event or landscape cards.
         if kingdom.events.length + kingdom.landmarks.length >= MAX_EVENTS_AND_LANDMARKS_IN_KINGDOM
            continue

         # Check if the selected index is an event card.
         eventIndex = index - cardsToUse.length
         if eventIndex < eventsToUse.length
            event = eventsToUse[eventIndex]
            kingdom.events.push(event)
            eventsToUse = eventsToUse.filter(filterByExcludedIds([event.id]))
            continue

         # Selected index must be a landmark card.
         landmarkIndex = eventIndex - eventsToUse.length
         landmark = landmarksToUse[landmarkIndex]
         kingdom.landmarks.push(landmark)
         landmarksToUse = landmarksToUse.filter(filterByExcludedIds([landmark.id]))

      return kingdom

   selectRandomCards = (cards, numberToSelect) ->
      randomIndexes = RandUtil.getRandomInts(numberToSelect, cards.length)
      selectedCards = (cards[index] for index in randomIndexes)
      return selectedCards

   flattenSetsForProperty = (sets, property) ->
      cards = []
      for setId, set of sets
         if set[property]
            for card in set[property]
               cards.push(card)
      return cards

   extractIds = (cardsOrSets) ->
      return (cardOrSet.id for cardOrSet in cardsOrSets)

   unionCards = (a, b) ->
      excludingB = a.filter(filterByExcludedIds(extractIds(b)))
      return excludingB.concat(b)

   filterSetsByAllowedSetIds = (setsArrayOrMap, allowedSetIds) ->
      setsArray = []
      for setId, set of setsArrayOrMap
         if allowedSetIds.indexOf(set.id) != -1
            setsArray.push(set)
      return setsArray

   filterSetsByExcludedSetIds = (setsArrayOrMap, excludedSetIds) ->
      setsArray = []
      for setId, set of setsArrayOrMap
         if excludedSetIds.indexOf(set.id) == -1
            setsArray.push(set)
      return setsArray

   filterByIncludedSetIds = (includeSetIds) ->
      return (item) -> return includeSetIds.indexOf(item.setId) != -1
   
   filterByExcludedSetIds = (includeSetIds) ->
      return (item) -> return includeSetIds.indexOf(item.setId) == -1

   filterByIncludedIds = (includeIds) ->
      return (item) -> return includeIds.indexOf(item.id) != -1

   filterByExcludedIds = (excludeIds) ->
      return (item) -> return excludeIds.indexOf(item.id) == -1

   filterByAllowedTypes = (allowedTypes) ->
      return (item) -> 
         for allowedType in allowedTypes
            if item[allowedType] == true
               return true
         return false

   filterByExcludedTypes = (excludedTypes) ->
      return (item) -> 
         for excludedType in excludedTypes
            if item[excludedType] == true
               return false
         return true

   filterByAllowedCost = (allowedCosts) ->
      costs = [
         Cost.TREASURE_2,
         Cost.TREASURE_2,
         Cost.TREASURE_2,
         Cost.TREASURE_3,
         Cost.TREASURE_4,
         Cost.TREASURE_5,
         Cost.TREASURE_6,
         Cost.TREASURE_7,
         Cost.TREASURE_8
      ]
      return (item) ->
         costType = costs[Math.min(item.cost.treasure, 8)]
         return allowedCosts.indexOf(costType) != -1

   shouldUseAlchemyForKingdom = (kingdom) ->
      hasAlchemyCard = false
      for card in kingdom.cards
         if card.setId == ALCHEMY_SET_ID
            hasAlchemyCard = true
            break
      useRandomly = !RandUtil.getRandomInt(0, 3)
      return hasAlchemyCard or useRandomly


   window.Randomizer = {
      createKingdom: createKingdom
      Cost: Cost
      Type: Type
   }
