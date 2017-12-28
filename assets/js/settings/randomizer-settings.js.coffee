#= require lib/all.js

do ->

   class RandomizerSettings
      constructor: (requireActionProvider, requireBuyProvider, allowAttacks, requireReaction,
            requireTrashing, prioritizeSet) ->
         @requireActionProvider = ko.observable(requireActionProvider)
         @requireBuyProvider = ko.observable(requireBuyProvider)
         @allowAttacks = ko.observable(allowAttacks)
         @requireReaction = ko.observable(requireReaction)
         @requireTrashing = ko.observable(requireTrashing)
         @prioritizeSet = ko.observable(prioritizeSet)

      toObject: () ->
         return {
            requireActionProvider: @requireActionProvider()
            requireBuyProvider: @requireBuyProvider()
            allowAttacks: @allowAttacks()
            requireReaction: @requireReaction()
            requireTrashing: @requireTrashing()
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
            data.prioritizeSet or null)


   window.RandomizerSettings = RandomizerSettings