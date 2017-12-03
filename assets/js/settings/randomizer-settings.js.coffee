#= require lib/all.js

do ->

   class RandomizerSettings
      constructor: (requireActionProvider, requireBuyProvider, allowAttacks, requireReaction,
            requireTrashing) ->
         @requireActionProvider = ko.observable(requireActionProvider)
         @requireBuyProvider = ko.observable(requireBuyProvider)
         @allowAttacks = ko.observable(allowAttacks)
         @requireReaction = ko.observable(requireReaction)
         @requireTrashing = ko.observable(requireTrashing)

      toObject: () ->
         return {
            requireActionProvider: @requireActionProvider()
            requireBuyProvider: @requireBuyProvider()
            allowAttacks: @allowAttacks()
            requireReaction: @requireReaction()
            requireTrashing: @requireTrashing()
         }

      @createFromObject: (data) ->
         data = data or {}
         return new RandomizerSettings(
            if data.requireActionProvider? then !!data.requireActionProvider else true,
            !!data.requireBuyProvider,
            if data.allowAttacks? then !!data.allowAttacks else true,
            !!data.requireReaction,
            !!data.requireTrashing)


   window.RandomizerSettings = RandomizerSettings