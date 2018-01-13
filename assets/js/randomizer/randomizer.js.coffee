#= require models/card-cost.js.coffee
#= require models/card-type.js.coffee
#= require models/kingdom.js.coffee
#= require models/supply.js.coffee
#= require utils/rand-util.js.coffee
#= require utils/card-util.js.coffee
#= require randomizer/card-supply-ban.js.coffee
#= require randomizer/cost-supply-ban.js.coffee
#= require randomizer/cost-supply-divider.js.coffee
#= require randomizer/reaction-supply-correction.js.coffee
#= require randomizer/set-supply-ban.js.coffee
#= require randomizer/set-supply-divider.js.coffee
#= require randomizer/supply-builder.js.coffee
#= require randomizer/supply-divisions.js.coffee
#= require randomizer/type-supply-ban.js.coffee
#= require randomizer/type-supply-requirement.js.coffee
#= require randomizer/util.js.coffee

do ->
   CardCost = window.CardCost
   CardSupplyBan = window.CardSupplyBan
   CardType = window.CardType
   CardUtil = window.CardUtil
   CostSupplyBan = window.CostSupplyBan
   CostSupplyDivider = window.CostSupplyDivider
   Kingdom = window.Kingdom
   RandUtil = window.RandUtil
   ReactionSupplyCorrection = window.ReactionSupplyCorrection
   SetSupplyBan = window.SetSupplyBan
   SetSupplyDivider = window.SetSupplyDivider
   SupplyBuilder = window.SupplyBuilder
   SupplyDivisions = window.SupplyDivisions
   Supply = window.Supply
   TypeSupplyRequirement = window.TypeSupplyRequirement
   TypeSupplyBan = window.TypeSupplyBan
   Util = window.Util

   SETS_WITH_DUPLICATES = {
      'baseset2': 'baseset',
      'intrigue2': 'intrigue'
   };

   MAX_RETRIES = 3

   NUM_CARDS_IN_KINGDOM = 10

   MIN_ALCHEMY_CARDS_IN_KINGDOM = 3
   MAX_ALCHEMY_CARDS_IN_KINGDOM = 5

   HIGH_COST_CUT_OFF = 5
   MIN_HIGH_CARDS_IN_KINGDOM = 3
   MAX_HIGH_CARDS_IN_KINGDOM = 5

   MAX_EVENTS_AND_LANDMARKS_IN_KINGDOM = 2

   NUM_PRIORITIZED_SET = 5

   createKingdom = (allSets, randomizerOptions) ->
      supply = createSupplyWithRetries(allSets, randomizerOptions)
      eventsAndLandmarks = getEventsAndLandmarks(allSets, randomizerOptions.getSetIds(), [], [])
      metadata = getMetadata(allSets, randomizerOptions.getSetIds())
      return new Kingdom(supply, eventsAndLandmarks.events, eventsAndLandmarks.landmarks, metadata)
   
   createSupplySafe = (allSets, randomizerOptions) ->
      try
         return createSupplyWithRetries(allSets, randomizerOptions)
      catch error
         console.log("Failed to create supply: \n#{error.toString()}")
         return null

   createSupplyWithRetries = (allSets, randomizerOptions) ->
      retries = MAX_RETRIES
      while retries > 0
         try 
            return createSupply(allSets, randomizerOptions)
         catch error
            console.log("Error when trying to select cards: \n" + error.toString())
            retries -= 1

      throw Error('Failed to select cards that satisfied all requirements.')

   createSupply = (allSets, randomizerOptions) ->
      allCards = Util.flattenSetsForProperty(allSets, 'cards')
      setsToUse = CardUtil.filterSetsByAllowedSetIds(allSets, randomizerOptions.getSetIds())
      cardsToUse = Util.flattenSetsForProperty(setsToUse, 'cards')
      cardsToUse = removeDuplicateCards(cardsToUse, randomizerOptions.getIncludeCardIds())

      supplyBuilder = new SupplyBuilder(cardsToUse)

      # Configure bans.
      if randomizerOptions.getExcludeCardIds().length
         supplyBuilder.addBan(new CardSupplyBan(randomizerOptions.getExcludeCardIds()))

      if randomizerOptions.getExcludeTypes().length
         supplyBuilder.addBan(new TypeSupplyBan(randomizerOptions.getExcludeTypes()))

      if randomizerOptions.getExcludeCosts().length
         supplyBuilder.addBan(new CostSupplyBan(randomizerOptions.getExcludeCosts()))

      # Configure requirements.
      if (randomizerOptions.getRequireSingleCardOfType() and
            randomizerOptions.getRequireSingleCardOfType() != CardType.NONE)
         supplyBuilder.addRequirement(
               new TypeSupplyRequirement(randomizerOptions.getRequireSingleCardOfType(), true))

      if randomizerOptions.getRequireActionProvider()
         supplyBuilder.addRequirement(new TypeSupplyRequirement(CardType.ACTION_SUPPLIER, false))

      if randomizerOptions.getRequireBuyProvider()
         supplyBuilder.addRequirement(new TypeSupplyRequirement(CardType.BUY_SUPPLIER, false))

      if randomizerOptions.getRequireTrashing()
         supplyBuilder.addRequirement(new TypeSupplyRequirement(CardType.TRASHING, false))

      # Configure dividers.
      remainingCards = NUM_CARDS_IN_KINGDOM

      if (randomizerOptions.getPrioritizeSet() and
            randomizerOptions.getPrioritizeSet() != SetId.ALCHEMY)
         supplyBuilder.addDivider(
               new SetSupplyDivider(randomizerOptions.getPrioritizeSet(), NUM_PRIORITIZED_SET))
         remainingCards -= NUM_PRIORITIZED_SET

      if shouldUseAlchemyDivider(randomizerOptions)
         alchemyCardsToUse = getNumberOfAlchemyCardsToUse(randomizerOptions, remainingCards)
         supplyBuilder.addDivider(new SetSupplyDivider(SetId.ALCHEMY, alchemyCardsToUse))
         remainingCards -= alchemyCardsToUse
      else if randomizerOptions.getSetIds().length > 1
         # Only ban all of the Alchemy cards when Alchemy isn't the only set selected.
         supplyBuilder.addBan(new SetSupplyBan([SetId.ALCHEMY]))

      if randomizerOptions.getDistributeCost()
         highCardsInKingdom = 
               RandUtil.getRandomInt(MIN_HIGH_CARDS_IN_KINGDOM, MAX_HIGH_CARDS_IN_KINGDOM)
         supplyBuilder.addDivider(new CostSupplyDivider(HIGH_COST_CUT_OFF, highCardsInKingdom))

      existingCards =
            allCards.filter(CardUtil.filterByIncludedIds(randomizerOptions.getIncludeCardIds()))
      selectedCards = createSupplyCardsWithRetries(supplyBuilder, existingCards)

      if randomizerOptions.getRequireReactionIfAttacks()
         correctedSupplyBuilder =
               correctSupplyBuilderForRequiredReaction(supplyBuilder, existingCards, selectedCards)
         if correctedSupplyBuilder
            supplyBuilder = correctedSupplyBuilder
            selectedCards = createSupplyCardsWithRetries(supplyBuilder, existingCards)

      metadata = new Supply.Metadata(
         supplyBuilder,
         randomizerOptions.getPrioritizeSet() or null,
         alchemyCardsToUse or null,
         highCardsInKingdom or null)

      return new Supply(selectedCards, metadata)

   getEventsAndLandmarks = (allSets, setIds, excludeIds, excludeLandmarkIds) ->
      setsToUse = CardUtil.filterSetsByAllowedSetIds(allSets, setIds)
      cards = Util.flattenSetsForProperty(setsToUse, 'cards')
      cardsEventsAndLandmarks = cards.concat(getEventsAndLandmarksFromSets(allSets, setIds, []))

      selectedCards = selectRandomCards(cardsEventsAndLandmarks, NUM_CARDS_IN_KINGDOM)
      selectedEvents = []
      selectedLandmarks = []
      for card in selectedCards
         if CardUtil.isEvent(card)
            selectedEvents.push(card)
         else if CardUtil.isLandmark(card)
            selectedLandmarks.push(card)
         if selectedEvents.length + selectedLandmarks.length >= MAX_EVENTS_AND_LANDMARKS_IN_KINGDOM
            break

      return {
         events: selectedEvents
         landmarks: selectedLandmarks
      }

   getRandomEventsOrLandmarks = (allSets, setIds, excludeIds, numberOfEventsOrLandmarks) ->
      eventsOrLandmarks = getEventsAndLandmarksFromSets(allSets, setIds, excludeIds)
      return selectRandomCards(eventsOrLandmarks, numberOfEventsOrLandmarks)

   getEventsAndLandmarksFromSets = (allSets, setIds, excludeIds) ->
      setsToUse = CardUtil.filterSetsByAllowedSetIds(allSets, setIds)
      events = Util.flattenSetsForProperty(setsToUse, 'events')
      landmarks = Util.flattenSetsForProperty(setsToUse, 'landmarks')
      return events.concat(landmarks).filter(CardUtil.filterByExcludedIds(excludeIds))

   getMetadata = (allSets, setIds) ->
      setsToUse = CardUtil.filterSetsByAllowedSetIds(allSets, setIds)
      useColonies = shouldUseSpecialtyCardFromSet(SetId.PROSPERITY, setsToUse)
      useShelters = shouldUseSpecialtyCardFromSet(SetId.DARK_AGES, setsToUse)
      return new Kingdom.Metadata(useColonies, useShelters)
   
   shouldUseSpecialtyCardFromSet = (setId, setsBeingUsed) ->
      index = CardUtil.extractIds(setsBeingUsed).indexOf(setId)
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

   shouldUseAlchemyDivider = (randomizerOptions) ->
      # Don't use the divider if Alchemy is the only selected set.
      if randomizerOptions.getSetIds().length == 1
         return false 

      if randomizerOptions.getPrioritizeSet() == SetId.ALCHEMY
         return true

      if randomizerOptions.getSetIds().indexOf(SetId.ALCHEMY) == -1
         return false

      if randomizerOptions.getSetIds().length < 3
         return true

      useRandomly = !RandUtil.getRandomInt(0, randomizerOptions.getSetIds().length)
      return useRandomly

   correctSupplyBuilderForRequiredReaction = (supplyBuilder, existingCards, selectedCards) ->
      # Check if the selected cards either have no attacks or have a reaction.
      if selectedCards.filter(CardUtil.filterByRequiredType(CardType.REACTION)).length
         return null

      if !selectedCards.filter(CardUtil.filterByRequiredType(CardType.ATTACK)).length
         return null

      supplyBuilder = supplyBuilder.clone()
      divisions = supplyBuilder.createUnfilledDivisions(existingCards)
      reactions = SupplyDivisions.getAvailableCardsOfType(divisions, CardType.REACTION)
      
      if reactions.length
         # Add a requirement for a reaction.
         supplyBuilder.addRequirement(new TypeSupplyRequirement(CardType.REACTION, false))
         return supplyBuilder

      # Ban attacks since there are no available reactions.
      supplyBuilder.addBan(new TypeSupplyBan(CardType.ATTACK))
      return supplyBuilder

   createSupplyCardsWithRetries = (supplyBuilder, existingCards) ->
      retries = MAX_RETRIES
      while retries > 0
         try 
            return supplyBuilder.createSupply(existingCards)
         catch error
            console.log("Error when trying to select cards: \n" + error.toString())
            retries -= 1

      throw Error('Failed to select cards that satisfied all requirements.')      

   getNumberOfAlchemyCardsToUse = (randomizerOptions, remainingCards) ->
      min = MIN_ALCHEMY_CARDS_IN_KINGDOM
      max = MAX_ALCHEMY_CARDS_IN_KINGDOM
   
      if randomizerOptions.getPrioritizeSet() == SetId.ALCHEMY
         min = Math.max(min, NUM_PRIORITIZED_SET)
         max = Math.max(max, MAX_ALCHEMY_CARDS_IN_KINGDOM)
   
      return RandUtil.getRandomInt(min, Math.min(max, remainingCards))

   removeDuplicateCards = (cards, requiredCardIds) ->
      # Removes duplicate cards; keep setA's version.
      # Cards to keep = (A - [B required as A]) + (B - ([A as B] - B required))
      for setA, setB of SETS_WITH_DUPLICATES
         setACards = cards.filter(CardUtil.filterByIncludedSetIds([setA]))
         setBCards = cards.filter(CardUtil.filterByIncludedSetIds([setB]))

         # B to exclude = ([A as B] - B required))
         setACardIdsAsSetB = replaceSetIdForCards(setACards, setB)
         setBRequiredCards = setBCards.filter(CardUtil.filterByIncludedIds(requiredCardIds))
         setBCardIdsToExclude = removeIds(setACardIdsAsSetB, CardUtil.extractIds(setBRequiredCards))

         # B to include = (B - B to exclude)
         setBCardIdsToInclude = removeIds(CardUtil.extractIds(setBCards), setBCardIdsToExclude)

         # A to include = (A - [B required as A])
         setBRequiredCardIdsAsSetA = replaceSetIdForCards(setBRequiredCards, setA)
         setACardIdsToInclude = removeIds(CardUtil.extractIds(setACards), setBRequiredCardIdsAsSetA)

         setACardsToExclude = removeIds(CardUtil.extractIds(setACards), setACardIdsToInclude)
         setBCardsToExclude = removeIds(CardUtil.extractIds(setBCards), setBCardIdsToInclude)

         cards = cards.filter(CardUtil.filterByExcludedIds(setACardsToExclude))
         cards = cards.filter(CardUtil.filterByExcludedIds(setBCardsToExclude))
      return cards

   removeIds = (ids, idsToRemove) ->
      return ids.filter((id) -> idsToRemove.indexOf(id) == -1)

   replaceSetIdForCards = (cards, newSetId) ->
      cardIds = []
      for card in cards
         cardIds.push(replaceSetIdInCardId(card.id, newSetId))
      return cardIds

   replaceSetIdInCardId = (cardId, newSetId) ->
       return newSetId + '_' + cardId.split('_')[1]


   window.Randomizer = {
      createKingdom: createKingdom
      createSupply: createSupply
      createSupplyWithRetries: createSupplyWithRetries
      createSupplySafe: createSupplySafe
      getEventsAndLandmarks: getEventsAndLandmarks
      getRandomEventsOrLandmarks: getRandomEventsOrLandmarks
   }
