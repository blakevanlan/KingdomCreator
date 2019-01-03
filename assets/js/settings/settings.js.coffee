#= require lib/all.js
#= require settings/randomizer-settings.js.coffee

do ->
   RandomizerSettings = window.RandomizerSettings

   SortOption = {
      SET: 'set',
      ALPHABETICAL: 'alpha',
      COST: 'cost'
   }

   class Settings
      constructor: (selectedSets, sortOption, randomizerSettings) ->
         @selectedSets = ko.observableArray(selectedSets)
         @sortOption = ko.observable(sortOption)
         @randomizerSettings = ko.observable(randomizerSettings)
         console.log(@sortOption())

      toObject: () ->
         return {
            sets: Settings.serializeSets(@selectedSets())
            sortOption: @sortOption()
            randomizerSettings: @randomizerSettings().toObject()
         }

      @createFromObject: (data) ->
         data = data or {}
         return new Settings(
            @deserializeSets(data),
            @deserailizeSort(data),
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

      @deserailizeSort: (data) -> 
         if data.sortOption
            for key, value of SortOption
               return value if data.sortOption == value
            return SortOption.SET
         if !!data.sortAlphabetically
            return SortOption.ALPHABETICAL
         return SortOption.SET


   window.Settings = Settings
   window.Settings.SortOption = SortOption
