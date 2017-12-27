#= require lib/all.js
#= require pages/page.js.coffee
#= require viewmodels/set.js.coffee
#= require settings/settings-manager.js.coffee

do ->
   PageViewModel = window.PageViewModel
   SetViewModel = window.SetViewModel
   SettingsManager = window.SettingsManager

   SUBTITLE = 'Recommended Sets of 10'
   FOUR_COLUMN_WIDTH = 450

   STARTING_SELECTED_SET = 'baseset'
   SETS_TO_IGNORE = ['baseset2', 'intrigue2', 'promos']

   class SetsViewModel extends PageViewModel
      constructor: (dominionSets, dominionKingdoms) ->
         super(SUBTITLE, PageViewModel.MenuItem.SETS)
         @dominionSets = dominionSets
         @dominionKingdoms = dominionKingdoms
         @sets = ko.observableArray(@createSetViewModels())
         @selectedSetId = ko.observable(STARTING_SELECTED_SET)
         @visibleKingdoms = @createVisibleKingdomsObservable()
         @numberOfColumns = ko.observable(4)
         @listenForResizeAndSetNumberOfColumns()

      createSetViewModels: ->
         sets = (set for setId, set of @dominionSets)
         sets.sort (a, b) ->
            return 0 if a.name == b.name
            return if a.name < b.name then -1 else 1
         viewModels = []
         for set in sets
            if SETS_TO_IGNORE.indexOf(set.id) == -1
               viewModels.push(new SetViewModel(set))
         return viewModels

      createVisibleKingdomsObservable: =>
         return ko.computed =>
            selectedSetId = @selectedSetId()

            visibleKingdoms = []
            for setId, kingdomsForSet of @dominionKingdoms
               for kingdom in kingdomsForSet.kingdoms
                  if kingdom.sets.indexOf(selectedSetId) != -1
                     visibleKingdoms.push(kingdom)

            return visibleKingdoms

      createRows: (cards) =>
         numberOfColumns = @numberOfColumns()
         rows = []
         for rowIndex in [0...numberOfColumns]
            startingIndex = rowIndex * numberOfColumns
            rows.push(cards.slice(startingIndex, startingIndex + numberOfColumns))            
         return rows

      listenForResizeAndSetNumberOfColumns: ->
         $(window).resize(@updateNumberOfColumns) 
         @updateNumberOfColumns()

      updateNumberOfColumns: =>
         isFourColumnWidth = $(window).width() <= FOUR_COLUMN_WIDTH
         @numberOfColumns(if isFourColumnWidth then 4 else 5)

      titleForEventsAndLandmarks: (kingdom) ->
         hasEvents = kingdom.events?.length
         hasLandmarks = kingdom.landmarks?.length
         return 'Events and Landmarks' if hasEvents and hasLandmarks
         return 'Events' if hasEvents
         return 'Landmarks' if hasLandmarks
         return null

      eventsAndLandmarks: (kingdom) ->
         events = kingdom.events or []
         landmarks = kingdom.landmarks or []
         return events.concat(landmarks)

   window.SetsViewModel = SetsViewModel
