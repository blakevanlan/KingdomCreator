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

   class SetsViewModel extends PageViewModel
      constructor: (dominionSets, dominionKingdoms) ->
         super(SUBTITLE, PageViewModel.MenuItem.SETS)
         @dominionSets = dominionSets
         @dominionKingdoms = dominionKingdoms
         @sets = ko.observableArray(@createSetViewModels())
         @visibleKingdoms = @createVisibleKingdomsObservable()
         @numberOfColumns = ko.observable(4)
         @listenForResizeAndSetNumberOfColumns()

      createSetViewModels: ->
         sets = (set for setId, set of @dominionSets)
         sets.sort (a, b) ->
            return 0 if a.name == b.name
            return if a.name < b.name then -1 else 1
         viewModels = []

         selectedSets = SettingsManager.loadSettings().selectedSets()
         for set in sets
            viewModel = new SetViewModel(set)
            viewModel.active(selectedSets.indexOf(set.id) != -1)
            viewModel.active.subscribe(@saveSettings)
            viewModels.push(viewModel)
         return viewModels

      saveSettings: () =>
         selectedSets = (set.id for set in @sets() when set.active())
         settings = SettingsManager.loadSettings()
         settings.selectedSets(selectedSets)
         SettingsManager.saveSettings(settings)

      createVisibleKingdomsObservable: =>
         return ko.computed =>
            visibleSetIds = (set.id for set in @sets() when set.active())
            visibleKingdoms = []
            for setId, kingdomsForSet of @dominionKingdoms
               for kingdom in kingdomsForSet.kingdoms
                  visible = true
                  for setIdInKingdom in kingdom.sets
                     if visibleSetIds.indexOf(setIdInKingdom) == -1
                        visible = false
                        break
                  visibleKingdoms.push(kingdom) if visible

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
