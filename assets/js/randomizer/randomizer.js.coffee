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
      VICTORY: 'isVictory'
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

   createKingdom = (allSets, options) ->
      allCards = flattenSets(allSets)
      options = options or {}
      setIds = options.setIds or (setId for setId, set of allSets)
      includeCardIds = options.includeCardIds or []
      excludeCardIds = options.excludeCardIds or []
      allowedTypes = options.allowedTypes or (value for type, value of Type)
      allowedCosts = options.allowedCosts or (value for cost, value of Cost)
      costMaximum = options.costMaximum or Number.MAX_VALUE
      requireActionProvider = !!options.requireActionProvider
      
      # Fill the kingdom with included cards.
      kingdom = allCards.filter(filterCardByIncludedIds(includeCardIds))
      setsToUse = filterSetsByAllowedSetIds(allSets, setIds)
      
      # Check if alchemy should be excluded. This is because it's only recommend to play with
      # alchemy if 3-5 alchemy cards are used.
      useAlchemy = shouldUseAlchemyForKingdom(kingdom)
      if not useAlchemy
         setsToUse = filterSetsByExcludedSetIds(setsToUse, [ALCHEMY_SET_ID])

      # Filter down to the set of useable cards.
      cardsToUse = flattenSets(setsToUse)
      cardsToUse = cardsToUse.filter(filterCardByExcludedIds(includeCardIds))
      cardsToUse = cardsToUse.filter(filterCardByExcludedIds(excludeCardIds))
      cardsToUse = cardsToUse.filter(filterCardByAllowedTypes(allowedTypes))
      cardsToUse = cardsToUse.filter(filterCardByAllowedCost(allowedCosts))

      # Fill the kingdom with cards and remove those cards from the usable set.
      kingdom = kingdom.concat(selectRandomCards(cardsToUse, NUM_CARDS_IN_KINGDOM - kingdom.length))
      cardsToUse = cardsToUse.filter(filterCardByExcludedIds(extractIds(kingdom)))

      # Adjust kingdom to have 3-5 alchemy cards if alchemy is being used.
      if useAlchemy
         kingdom = adjustKingdomForAlchemyCards(kingdom, cardsToUse, includeCardIds)

      if requireActionProvider
         kingdom = adjustKingdomForActionProvider(kingdom, cardsToUse, includeCardIds)

      return {
         cards: kingdom
         metadata: {
            useColonies: shouldUseSpecialtyCardForSet(PROSPERITY_SET_ID, setsToUse)
            useShelters: shouldUseSpecialtyCardForSet(DARK_AGES_SET_ID, setsToUse)
         }
      }

   adjustKingdomForAlchemyCards = (kingdom, cardsToUse, requiredCardIds) ->      
      alchemyCards = kingdom.filter(filterCardByIncludedSetIds([ALCHEMY_SET_ID]))
      if alchemyCards.length == 0
         # Return the existing kingdom if no alchemy cards were randomly selected.
         return kingdom

      # Check if the kingdom needs to be readjusted to have 3-5 alchemy cards in the kingdom.
      if MIN_ALCHEMY_CARDS_IN_KINGDOM <= alchemyCards.length <= MAX_ALCHEMY_CARDS_IN_KINGDOM
         return kingdom

      replaceableCards = kingdom.filter(filterCardByExcludedIds(requiredCardIds))
      replaceableCards = kingdom.filter(filterCardByExcludedSetIds([ALCHEMY_SET_ID]))
      numberOfAlchemyCardsToUse = 
         RandUtil.getRandomInt(MIN_ALCHEMY_CARDS_IN_KINGDOM, MAX_ALCHEMY_CARDS_IN_KINGDOM + 1)
      
      # Calculate the number of new alchemy cards, bounded by the number of cards that can be
      # swapped out.
      numberOfNewAlchemyCards =
            Math.min(numberOfAlchemyCardsToUse - alchemyCards.length, replaceableCards.length)
      if numberOfNewAlchemyCards <= 0
         return kingdom

      # Combine the required cards and the 
      cards = kingdom.filter(filterCardByIncludedIds(requiredCardIds))
      cards = unionCards(cards, alchemyCards)

      # Added the additional alchemy cards.
      possibleAlchemyCards = cardsToUse.filter(filterCardByIncludedSetIds([ALCHEMY_SET_ID]))
      cards = cards.concat(selectRandomCards(possibleAlchemyCards, numberOfNewAlchemyCards))
      
      # Added the cards that weren't required but were kept anyways.
      cards = cards.concat(
            selectRandomCards(replaceableCards, replaceableCards.length - numberOfNewAlchemyCards))

      return cards

   adjustKingdomForActionProvider = (kingdom, cardsToUse, requiredCardIds) ->
      actionProviders = kingdom.filter(filterCardByAllowedTypes([Type.ACTION_SUPPLIER]))
      # Ensure that there is at least one action provider in the kingdom.
      if actionProviders.length >= 1
         return kingdom

      replaceableCards = kingdom.filter(filterCardByExcludedIds(requiredCardIds))
      if replaceableCards.length < 1
         return kingdom

      cardToBeReplace = selectRandomCards(replaceableCards, 1)
      actionSupplierCards = cardsToUse.filter(filterCardByAllowedTypes(Type.ACTION_SUPPLIER))
      actionSupplierCard = selectRandomCards(actionSupplierCards, 1)

      cards = kingdom.filter(filterCardByExcludedIds([actionSupplierCard.id]))
      cards = cards.concat(actionSupplierCard)
      return cards

   shouldUseSpecialtyCardForSet = (setId, setsBeingUsed) ->
      index = extractIds(setsBeingUsed).indexOf(setId)
      return false if index == -1
      numberOfSpecialtySetCards = setsBeingUsed[index].cards.length
      numberOfCardsBeingUsed = 0
      for set in setsBeingUsed
         numberOfCardsBeingUsed += set.cards.length
      index = RandUtil.getRandomInt(0, numberOfCardsBeingUsed)
      return index < numberOfSpecialtySetCards

   selectRandomCards = (cards, numberToSelect) ->
      randomIndexes = RandUtil.getRandomInts(numberToSelect, cards.length)
      selectedCards = (cards[index] for index in randomIndexes)
      return selectedCards

   flattenSets = (sets) ->
      cards = []
      for setId, set of sets
         for card in set.cards
            cards.push(card)
      return cards

   extractIds = (cardsOrSets) ->
      return (cardOrSet.id for cardOrSet in cardsOrSets)

   unionCards = (a, b) ->
      excludingB = a.filter(filterCardByExcludedIds(extractIds(b)))
      return excludingB.concat(b)

   filterSetsByAllowedSetIds = (setsMap, allowedSetIds) ->
      setsArray = []
      for setId, set of setsMap
         if allowedSetIds.indexOf(setId) != -1
            setsArray.push(set)
      return setsArray

   filterSetsByExcludedSetIds = (setsMap, excludedSetIds) ->
      setsArray = []
      for setId, set of setsMap
         if excludedSetIds.indexOf(setId) == -1
            setsArray.push(set)
      return setsArray

   filterCardByIncludedSetIds = (includeSetIds) ->
      return (card) -> return includeSetIds.indexOf(card.setId) != -1
   
   filterCardByExcludedSetIds = (includeSetIds) ->
      return (card) -> return includeSetIds.indexOf(card.setId) == -1

   filterCardByIncludedIds = (includeCardIds) ->
      return (card) -> return includeCardIds.indexOf(card.id) != -1

   filterCardByExcludedIds = (excludeCardIds) ->
      return (card) -> return excludeCardIds.indexOf(card.id) == -1

   filterCardByAllowedTypes = (allowedTypes) ->
      return (card) -> 
         for allowedType in allowedTypes
            if card[allowedType] == true
               return true
         return false

   filterCardByAllowedCost = (allowedCosts) ->
      return (card) ->
         if card.cost.treasure <= 2
            return allowedCosts.indexOf(Cost.TREASURE_2) != -1
         if card.cost.treasure <= 3
            return allowedCosts.indexOf(Cost.TREASURE_3) != -1
         if card.cost.treasure <= 4
            return allowedCosts.indexOf(Cost.TREASURE_4) != -1
         if card.cost.treasure <= 5
            return allowedCosts.indexOf(Cost.TREASURE_5) != -1
         if card.cost.treasure <= 6
            return allowedCosts.indexOf(Cost.TREASURE_6) != -1
         if card.cost.treasure <= 7
            return allowedCosts.indexOf(Cost.TREASURE_7) != -1
         return allowedCosts.indexOf(Cost.TREASURE_8) != -1

   shouldUseAlchemyForKingdom = (kingdom) ->
      hasAlchemyCard = false
      for card in kingdom
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
