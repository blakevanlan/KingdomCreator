#= require lib/all.js
#= require settings/randomizer-settings.js.coffee

do ->
   RandomizerSettings = window.RandomizerSettings

   class Settings
      constructor: (selectedSets, sortAlphabetically, showSetOnCards, randomizerSettings) ->
         @selectedSets = ko.observableArray(selectedSets)
         @sortAlphabetically = ko.observable(sortAlphabetically)
         @showSetOnCards = ko.observable(showSetOnCards)
         @randomizerSettings = ko.observable(randomizerSettings)

      toObject: () ->
         return {
            sets: @selectedSets().join(',')
            sortAlphabetically: @sortAlphabetically()
            showSet: @showSetOnCards()
            randomizerSettings: @randomizerSettings().toObject()
         }

      @createFromObject: (data) ->
         data = data or {}
         return new Settings(
            if data.sets? then data.sets.split(',') else ['baseset'],
            !!data.sortAlphabetically,
            if data.showSet? then !!data.showSet else true,
            RandomizerSettings.createFromObject(
               if data.randomizerSettings? then data.randomizerSettings else data))


   window.Settings = Settings