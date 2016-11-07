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
      allowedCosts = options.allowedCosts or (value for cost, value of Cost)
      requireActionProvider = !!options.requireActionProvider
      requireBuyProvider = !!options.requireBuyProvider
      
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
      cardsToUse = cardsToUse.filter(filterByAllowedCost(allowedCosts))

      eventsToUse = flattenSetsForProperty(setsToUse, 'events')
      eventsToUse = eventsToUse.filter(filterByExcludedIds(includeEventIds))
      eventsToUse = eventsToUse.filter(filterByExcludedIds(excludeEventIds))

      landmarksToUse = flattenSetsForProperty(setsToUse, 'landmarks')
      landmarksToUse = landmarksToUse.filter(filterByExcludedIds(includeLandmarkIds))
      landmarksToUse = landmarksToUse.filter(filterByExcludedIds(excludeLandmarkIds))

      # Fill the kingdom with cards and remove those cards from the usable set.
      kingdom = fillKingdom(kingdom, cardsToUse, eventsToUse, landmarksToUse)
      cardsToUse = cardsToUse.filter(filterByExcludedIds(extractIds(kingdom.cards)))

      # Adjust kingdom to have 3-5 alchemy cards if alchemy is being used.
      if useAlchemy
         kingdom = adjustKingdomForAlchemyCards(kingdom, cardsToUse, includeCardIds)

      if requireActionProvider
         result = adjustKingdomToIncludeType(Type.ACTION_SUPPLIER, kingdom, cardsToUse, includeCardIds)
         kingdom = result.kingdom
         if result.newCard
            cardsToUse = cardsToUse.filter(filterByExcludedIds(result.newCard))
            includeCardIds.push(result.newCard)

      if requireBuyProvider
         result = adjustKingdomToIncludeType(Type.BUY_SUPPLIER, kingdom, cardsToUse, includeCardIds)
         kingdom = result.kingdom

      return {
         kingdom: kingdom
         metadata: {
            useColonies: shouldUseSpecialtyCardForSet(PROSPERITY_SET_ID, setsToUse)
            useShelters: shouldUseSpecialtyCardForSet(DARK_AGES_SET_ID, setsToUse)
         }
      }

   adjustKingdomForAlchemyCards = (kingdom, cardsToUse, requiredCardIds) ->      
      alchemyCards = kingdom.cards.filter(filterByIncludedSetIds([ALCHEMY_SET_ID]))
      if alchemyCards.length == 0
         # Return the existing kingdom if no alchemy cards were randomly selected.
         return kingdom

      # Check if the kingdom needs to be readjusted to have 3-5 alchemy cards in the kingdom.
      if MIN_ALCHEMY_CARDS_IN_KINGDOM <= alchemyCards.length <= MAX_ALCHEMY_CARDS_IN_KINGDOM
         return kingdom

      replaceableCards = kingdom.cards.filter(filterByExcludedIds(requiredCardIds))
      replaceableCards = kingdom.cards.filter(filterByExcludedSetIds([ALCHEMY_SET_ID]))
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
      existingCardsOfType = kingdom.cards.filter(filterCardByAllowedTypes([type]))
      # Ensure that there is at least one action provider in the kingdom.
      if existingCardsOfType.length >= 1
         return {kingdom: kingdom, newCard: null}

      replaceableCards = kingdom.cards.filter(filterByExcludedIds(requiredCardIds))
      if replaceableCards.length < 1
         return {kingdom: kingdom, newCard: null}

      cardsToBeReplaced = selectRandomCards(replaceableCards, 1)
      cardsOfTypes = cardsToUse.filter(filterCardByAllowedTypes([type]))
      newCardOfType = selectRandomCards(cardsOfTypes, 1)

      cards = kingdom.cards.filter(filterByExcludedIds(extractIds(cardsToBeReplaced)))
      kingdom.cards = cards.concat(newCardOfType)
      return {kingdom: kingdom, newCard: newCardOfType}

   shouldUseSpecialtyCardForSet = (setId, setsBeingUsed) ->
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
         kingdom.events.push(landmark)
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

   filterCardByAllowedTypes = (allowedTypes) ->
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
