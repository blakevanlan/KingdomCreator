#= require lib/all.js

do ->

   class RandomizerSettings
      constructor: (requireActionProvider, requireBuyProvider, allowAttacks, requireReaction,
            requireTrashing, distributeCost, prioritizeSet) ->
         @requireActionProvider = ko.observable(requireActionProvider)
         @requireBuyProvider = ko.observable(requireBuyProvider)
         @allowAttacks = ko.observable(allowAttacks)
         @requireReaction = ko.observable(requireReaction)
         @requireTrashing = ko.observable(requireTrashing)
         @distributeCost = ko.observable(distributeCost)
         @prioritizeSet = ko.observable(prioritizeSet)

      toObject: () ->
         return {
            requireActionProvider: @requireActionProvider()
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
            !!data.requireBuyProvider,
            if data.allowAttacks? then !!data.allowAttacks else true,
            !!data.requireReaction,
            !!data.requireTrashing,
            !!data.distributeCost,
            data.prioritizeSet or null)


   window.RandomizerSettings = RandomizerSettings