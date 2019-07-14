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

            visibleKingdoms.sort(@compareKingdoms)
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

      titleForAddons: (kingdom) ->
         hasEvents = kingdom.events?.length
         hasLandmarks = kingdom.landmarks?.length
         hasProjects = kingdom.projects?.length
         return 'Events, Landmarks and Projects' if hasEvents and hasLandmarks and hasProjects
         return 'Events and Landmarks' if hasEvents and hasLandmarks
         return 'Events and Projects' if hasEvents and hasProjects
         return 'Landmarks and Projects' if hasLandmarks and hasProjects
         return 'Events' if hasEvents
         return 'Landmarks' if hasLandmarks
         return 'Projects' if hasProjects
         return null

      addons: (kingdom) ->
         events = kingdom.events or []
         landmarks = kingdom.landmarks or []
         projects = kingdom.projects or []
         return events.concat(landmarks, projects)

      compareKingdoms: (a, b) =>
         setsFromA = @sortedSets(a)
         setsFromB = @sortedSets(b)
         return -1 if setsFromA.length < setsFromB.length
         return 1 if setsFromA.length > setsFromB.length
         return -1 if setsFromA[0] < setsFromB[0]
         return 1 if setsFromB[0] > setsFromB[0]
         for i in [1...setsFromA.length]
            return -1 if setsFromA[i] < setsFromB[i]
            return 1 if setsFromA[i] > setsFromB[i]
         return 0

      sortedSets: (kingdom) ->
         sortedSets = kingdom.sets 
         sortedSets.sort()
         return sortedSets


   window.SetsViewModel = SetsViewModel
