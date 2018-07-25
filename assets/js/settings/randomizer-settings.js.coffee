#= require lib/all.js

do ->

   class RandomizerSettings
      constructor: (requireActionProvider, requireCardProvider, requireBuyProvider, allowAttacks,
            requireReaction, requireTrashing, distributeCost, prioritizeSet) ->
         @requireActionProvider = ko.observable(requireActionProvider)
         @requireCardProvider = ko.observable(requireCardProvider)
         @requireBuyProvider = ko.observable(requireBuyProvider)
         @allowAttacks = ko.observable(allowAttacks)
         @requireReaction = ko.observable(requireReaction)
         @requireTrashing = ko.observable(requireTrashing)
         @distributeCost = ko.observable(distributeCost)
         @prioritizeSet = ko.observable(prioritizeSet)

      toObject: () ->
         return {
            requireActionProvider: @requireActionProvider()
            requireCardProvider: @requireCardProvider()
            requireBuyProvider: @requireBuyProvider()
            allowAttacks: @allowAttacks()
            requireReaction: @requireReaction()
            requireTrashing: @requireTrashing()
            distributeCost: @distributeCost()
            prioritizeSet: @prioritizeSet()
         }

      @createFromObject: (data) ->
         data = data or {}
         return new RandomizerSettings(
            if data.requireActionProvider? then !!data.requireActionProvider else true,
            if data.requireCardProvider? then !!data.requireCardProvider else false,
            !!data.requireBuyProvider,
            if data.allowAttacks? then !!data.allowAttacks else true,
            !!data.requireReaction,
            !!data.requireTrashing,
            !!data.distributeCost,
            data.prioritizeSet or null)


   window.RandomizerSettings = RandomizerSettings