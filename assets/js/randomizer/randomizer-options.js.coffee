#= require models/card-cost.js.coffee
#= require models/card-type.js.coffee
#= require models/set-id.js.coffee

do -> 
   SetId = window.SetId
   CardCost = window.CardCost
   CardType = window.CardType

   class RandomizerOptions
      constructor: ->
         @setIds = SetId.BASE_SET
         @includeCardIds = []
         @excludeCardIds = []
         @requireSingleCardOfType = CardType.NONE
         @excludeTypes =  []
         @excludeCosts = []
         @requireActionProvider = true
         @requireBuyProvider = false
         @requireReactionIfAttacks = false
         @requireTrashing = false
         @distributeCost = false
         @prioritizeSet = null

      getSetIds: ->
         return @setIds

      setSetIds: (setIds) ->
         @setIds = setIds 
         return @

      getIncludeCardIds: ->
         return @includeCardIds

      setIncludeCardIds: (includeCardIds) ->
         @includeCardIds = includeCardIds 
         return @

      getExcludeCardIds: ->
         return @excludeCardIds

      setExcludeCardIds: (excludeCardIds) ->
         @excludeCardIds = excludeCardIds 
         return @

      getRequireSingleCardOfType: ->
         return @requireSingleCardOfType

      setRequireSingleCardOfType: (requireSingleCardOfType) ->
         @requireSingleCardOfType = requireSingleCardOfType
         return @

      getExcludeTypes: ->
         return @excludeTypes

      setExcludeTypes: (excludeTypes) ->
         @excludeTypes = excludeTypes
         return @

      getExcludeCosts: ->
         return @excludeCosts

      setExcludeCosts: (excludeCosts) ->
         @excludeCosts = excludeCosts
         return @

      getRequireActionProvider: ->
         return @requireActionProvider

      setRequireActionProvider: (requireActionProvider) ->
         @requireActionProvider = requireActionProvider
         return @

      getRequireBuyProvider: ->
         return @requireBuyProvider

      setRequireBuyProvider: (requireBuyProvider) ->
         @requireBuyProvider = requireBuyProvider
         return @

      getRequireReactionIfAttacks: ->
         return @requireReactionIfAttacks

      setRequireReactionIfAttacks: (requireReactionIfAttacks) ->
         @requireReactionIfAttacks = requireReactionIfAttacks
         return @

      getRequireTrashing: ->
         return @requireTrashing

      setRequireTrashing: (requireTrashing) ->
         @requireTrashing = requireTrashing
         return @

      getDistributeCost: ->
         return @distributeCost

      setDistributeCost: (distributeCost) ->
         @distributeCost = distributeCost
         return @

      getPrioritizeSet: ->
         return @prioritizeSet

      setPrioritizeSet: (prioritizeSet) ->
         @prioritizeSet = prioritizeSet
         return @


   window.RandomizerOptions = RandomizerOptions
