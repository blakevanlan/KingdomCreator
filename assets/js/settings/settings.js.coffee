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
            sets: Settings.serializeSets(@selectedSets())
            sortAlphabetically: @sortAlphabetically()
            showSet: @showSetOnCards()
            randomizerSettings: @randomizerSettings().toObject()
         }

      @createFromObject: (data) ->
         data = data or {}
         return new Settings(
            @deserializeSets(data),
            !!data.sortAlphabetically,
            if data.showSet? then !!data.showSet else true,
            RandomizerSettings.createFromObject(
               if data.randomizerSettings? then data.randomizerSettings else data))

      @serializeSets: (sets) ->
         if sets.length
            return sets.join(',')
         return 'baseset'

      @deserializeSets: (data) ->
         if data.sets?
            setIds = data.sets.split(',')
            if setIds.length and setIds[0].length
               return setIds
         return ['baseset']


   window.Settings = Settings