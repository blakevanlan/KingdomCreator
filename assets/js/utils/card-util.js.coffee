#= require models/card-cost.js.coffee
#= require models/card-type.js.coffee

do ->
   CardCost = window.CardCost
   CardCostValues = window.CardCostValues
   CardType = window.CardType

   extractIds = (cardsOrSets) ->
      return (cardOrSet.id for cardOrSet in cardsOrSets)

   unionCards = (a, b) ->
      excludingB = a.filter(filterByExcludedIds(extractIds(b)))
      return excludingB.concat(b)

   findCardById = (cards, cardId) ->
      for card in cards 
         if card.id == cardId 
            return card
      return null

   isEvent = (card) ->
      return card.id.indexOf("_event_") != -1

   isLandmark = (card) ->
      return card.id.indexOf("_landmark_") != -1

   isProject = (card) ->
      return card.id.indexOf("_project_") != -1

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

   filterByRequiredType = (requiredType) ->
      if requiredType == CardType.NONE
         return (item) -> return true 

      return (item) ->
         if item[requiredType] == true
            return true
         return false

   filterByAllowedCosts = (allowedCosts) ->
      return (item) ->
         costType = CardCostValues[Math.min(item.cost.treasure, 8)]
         return allowedCosts.indexOf(costType) != -1

   filterByExcludedCosts = (excludedCosts) ->
      return (item) ->
         costType = CardCostValues[Math.min(item.cost.treasure, 8)]
         return excludedCosts.indexOf(costType) == -1

   window.CardUtil = {
      extractIds: extractIds
      unionCards: unionCards
      findCardById: findCardById
      isEvent: isEvent
      isLandmark: isLandmark
      isProject: isProject
      filterSetsByAllowedSetIds: filterSetsByAllowedSetIds
      filterSetsByExcludedSetIds: filterSetsByExcludedSetIds
      filterByIncludedSetIds: filterByIncludedSetIds
      filterByExcludedSetIds: filterByExcludedSetIds
      filterByIncludedIds: filterByIncludedIds
      filterByExcludedIds: filterByExcludedIds
      filterByAllowedTypes: filterByAllowedTypes
      filterByExcludedTypes: filterByExcludedTypes
      filterByRequiredType: filterByRequiredType
      filterByAllowedCosts: filterByAllowedCosts
      filterByExcludedCosts: filterByExcludedCosts
   }
