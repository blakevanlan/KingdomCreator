#= require lib/all.js
#= require models/card-type.js.coffee
#= require pages/page.js.coffee
#= require randomizer/randomizer.js.coffee
#= require randomizer/randomizer-options.js.coffee
#= require randomizer/serializer.js.coffee
#= require settings/settings-manager.js.coffee
#= require viewmodels/card.js.coffee
#= require viewmodels/dialog.js.coffee
#= require viewmodels/metadata.js.coffee
#= require viewmodels/set.js.coffee

do ->
   CardType = window.CardType
   CardViewModel = window.CardViewModel
   DialogViewModel = window.DialogViewModel
   MetadataViewModel = window.MetadataViewModel
   PageViewModel = window.PageViewModel
   SetViewModel = window.SetViewModel
   SettingsManager = window.SettingsManager

   Randomizer = window.Randomizer
   RandomizerOptions = window.RandomizerOptions
   Serializer = window.Serializer

   MIN_SETS_FOR_PRIORITIZE_OPTION = 3
   MIN_CARDS_FOR_DISTRIBUTE_COST = 24

   SUBTITLE = 'Dominion randomizer for desktop and mobile'

   class IndexViewModel extends PageViewModel
      constructor: (dominionSets) ->
         super(SUBTITLE, PageViewModel.MenuItem.RANDOMIZER)
         @dominionSets = dominionSets
         @kingdom = null
         @sets = ko.observableArray(@createSetViewModels())
         @cards = ko.observableArray(new CardViewModel(@) for i in [0...10])
         @eventsAndLandmarks = ko.observableArray(new CardViewModel(@, false) for i in [0...2])
         @distributeCostAllowed = @createDistributeCostAllowedObservable()
         @prioritizeSetEnabled = ko.observable()
         @prioritizeSetAllowed = @createPrioritizeSetAllowedObservable()
         @prioritizeSetAllowed.subscribe(@prioritizeSetAllowedChanged)
         @prioritizeSetOptions = @createPrioritizeSetOptionsObservable()
         
         # Load settings from cookie.
         @settings = null
         @randomizerSettings = null
         @loadOptionsFromSettings()

         @isEnlarged = ko.observable(false)
         @metadata = new MetadataViewModel()
         @dialog = new DialogViewModel(@sets())
         @hasLoaded = ko.observable(false)
         @showEventsAndLandmarks = @createShowEventsAndLandmarksObservable()
         @eventsAndLandmarksHeader = @createEventsAndLandmarksHeaderObservable()
         @randomizeButtonText = @createRandomizeButtonTextObservable()
         @loadCardBacks()
         @loadInitialKingdom()

      loadInitialKingdom: () =>
         kingdomFromUrl = Serializer.deserializeKingdom(@dominionSets, location.search)
         if kingdomFromUrl
            if kingdomFromUrl.getSupply().getCards().length == 10
               @setKingdom(kingdomFromUrl)
               return

            # Randomize the rest of the set if there are less than 10 cards.
            options = @createRandomizerOptions()
               .setSetIds(@getSelectedSetIds())
               .setExcludeTypes(@getExcludeTypes())
               .setIncludeCardIds(card.id for card in kingdomFromUrl.getSupply().getCards())
               
            supply = Randomizer.createSupply(@dominionSets, options)
            kingdom = new Kingdom(supply, kingdomFromUrl.getEvents(), kingdomFromUrl.getLandmarks(),
                  kingdomFromUrl.getMetadata())
            @setKingdom(kingdom)
            return

         @randomize()

      randomize: () =>
         selectedCards = @getSelectedCards()
         isEventOrLandmarkSelected = (@getSelectedEvents().length or
               @getSelectedLandmarks().length or
               @getSelectedUndefinedEventOrLandmarks().length)

         if (!selectedCards.length and !isEventOrLandmarkSelected)
            @randomizeFullKingdom()
            return

         # Show a dialog for customizing when randomizing a single card for specifying the card.
         if selectedCards.length == 1 and !isEventOrLandmarkSelected
            dialogOptions = {typeStates: {}}
            @dialog.open(dialogOptions, @randomizeIndividualSelectedCard)
         
         if selectedCards.length > 1
            @randomizeSelectedCards()

         if isEventOrLandmarkSelected
            @randomizeSelectedEventsAndLandmarks()

      randomizeFullKingdom: ->
         setIds = @getSelectedSetIds()
         return unless setIds.length

         card.setToLoading() for card in @cards()
         card.setToLoading() for card in @eventsAndLandmarks()

         options = @createRandomizerOptions()
            .setSetIds(setIds)
            .setExcludeCardIds(@getCardsToExclude())
            .setExcludeTypes(@getExcludeTypes())

         @setKingdom(Randomizer.createKingdom(@dominionSets, options))
         @saveSettings()

      randomizeSelectedCards: =>
         options = @createRandomizerOptions()
            .setSetIds(@getSelectedSetIds())
            .setIncludeCardIds(@extractCardIds(@getUnselectedCards()))
            .setExcludeCardIds(@extractCardIds(@getSelectedCards()))
            .setExcludeTypes(@getExcludeTypes())

         supply = Randomizer.createSupplySafe(@dominionSets, options)
         @replaceSelectedCardsWithSupply(supply) if supply

      randomizeSelectedEventsAndLandmarks: =>
         selectedEventsAndLandmarks = @getSelectedEvents().concat(@getSelectedLandmarks())
         newEventsAndLandmarksCount = 
               selectedEventsAndLandmarks.length + @getSelectedUndefinedEventOrLandmarks().length
         
         setIds = @getSelectedSetIds()
         selectedEventAndLandmarkIds = (card.id for card in selectedEventsAndLandmarks)
         
         newCards = Randomizer.getRandomEventsOrLandmarks(@dominionSets, setIds,
               selectedEventAndLandmarkIds,newEventsAndLandmarksCount)
         @replaceSelectedEventsAndLandmarks(newCards)
         
      randomizeIndividualSelectedCard: =>
         excludeTypes = []
         if @dialog.selectedType() and !@randomizerSettings.allowAttacks()
            excludeTypes.push(CardType.ATTACK)

         options = new RandomizerOptions()
            .setSetIds(ko.unwrap(set.id) for set in @dialog.sets when set.active())
            .setIncludeCardIds(@extractCardIds(@getUnselectedCards()))
            .setExcludeCardIds(@extractCardIds(@getSelectedCards()))
            .setExcludeTypes(excludeTypes)
            .setExcludeCosts(ko.unwrap(costs.id) for costs in @dialog.costs when not costs.active())
         
         if @dialog.selectedType()
            options.setRequireSingleCardOfType(@dialog.selectedType())
         else
            options
               .setRequireActionProvider(@randomizerSettings.requireActionProvider())
               .setRequireBuyProvider(@randomizerSettings.requireBuyProvider())
               .setRequireTrashing(@randomizerSettings.requireTrashing())
               .setRequireReactionIfAttacks(@randomizerSettings.requireReaction())
         
         supply = Randomizer.createSupplySafe(@dominionSets, options)
         @replaceSelectedCardsWithSupply(supply) if supply

      replaceSelectedCardsWithSupply: (supply) ->
         selectedCards = @getSelectedCards()
         nonSelectedCardIds = @extractCardIds(@getUnselectedCards())
         
         # Set cards to loading and get the new cards.
         card.setToLoading() for card in selectedCards

         @kingdom = new Kingdom(supply, @kingdom.getEvents(), @kingdom.getLandmarks(),
               @kingdom.getMetadata())
         sets = @sets()
         imagesLeftToLoad = selectedCards.length
         
         # Use this function to sync all of the images so that the sort
         # only happens after all have loaded.
         registerComplete = => 
            if --imagesLeftToLoad <= 0 
               setTimeout((=> @sortCards()), CardViewModel.ANIMATION_TIME)
         
         setCardData = (card, data) =>
            card.setData(data, sets)
            if card.cardImageLoaded()
               registerComplete()
            else
               # Capture the subscription so we can dispose after the image loads.
               do =>
                  subscription = card.cardImageLoaded.subscribe (val) =>
                     return unless val
                     subscription.dispose()
                     registerComplete()

         nextSelectedCardIndex = 0
         for cardData in @kingdom.getSupply().getCards()
            if (nonSelectedCardIds.indexOf(cardData.id) == -1 and
                  nextSelectedCardIndex < selectedCards.length)
               setCardData(selectedCards[nextSelectedCardIndex++], cardData)

      replaceSelectedEventsAndLandmarks: (newEventsAndLandmarks) ->
         selectedEvents = @getSelectedEvents()
         selectedLandmarks = @getSelectedLandmarks()
         selectedUndefinedEventOrLandmark = @getSelectedUndefinedEventOrLandmarks()
         selectedEventsAndLandmarks =
               selectedEvents.concat(selectedLandmarks).concat(selectedUndefinedEventOrLandmark)
         
         card.setToLoading() for card in selectedEventsAndLandmarks
         nonSelectedEventAndLandmarkIds =
               (ko.unwrap(card.id) for card in @eventsAndLandmarks() when !card.selected()) 
         
         sets = @sets()
         nextIndex = 0
         for cardData in newEventsAndLandmarks
            if (nonSelectedEventAndLandmarkIds.indexOf(cardData.id) == -1 and
                  nextIndex < selectedEventsAndLandmarks.length)
               selectedEventsAndLandmarks[nextIndex++].setData(cardData, sets)

      setKingdom: (kingdom) ->
         @kingdom = kingdom

         sortedSupply = @kingdom.getSupply().getCards().concat()
         sortedSupply.sort(@cardSorter)
         events = @kingdom.getEvents()
         landmarks = @kingdom.getLandmarks()

         cards = @cards()
         sets = @sets()
         for card, index in sortedSupply
            cards[index].setData(card, sets)
         for eventOrLandmark, index in @eventsAndLandmarks()
            if index < events.length
               eventOrLandmark.setData(events[index], sets)
               continue
            landmarkIndex = index - events.length
            if landmarkIndex < landmarks.length
               eventOrLandmark.setData(landmarks[landmarkIndex], sets)
               continue
            else
               eventOrLandmark.setToLoading()

         @metadata.update(kingdom.getMetadata())
         @updateUrlForKingdom(kingdom)

      toggleEnlarged: ->
         @isEnlarged(!@isEnlarged())

      createSetViewModels:  ->
         sets = (set for setId, set of @dominionSets)
         sets.sort (a, b) ->
            return 0 if a.name == b.name
            return if a.name < b.name then -1 else 1

         return (new SetViewModel(set) for set in sets)

      createShowEventsAndLandmarksObservable: ->
         return ko.computed =>
            return false unless @hasLoaded()
            for setViewModel in ko.unwrap(@sets)
               if ko.unwrap(setViewModel.active)
                  set = @dominionSets[ko.unwrap(setViewModel.id)]
                  if set.events?.length or set.landmarks?.length
                     return true

            # Check if the current kingdom has any events or landmarks.
            for eventOrLandmark in @eventsAndLandmarks()
               if !ko.unwrap(eventOrLandmark.isLoading)
                  return true
            return false

      createEventsAndLandmarksHeaderObservable: ->
         return ko.computed =>
            hasEvents = false
            hasLandmarks = false
            for setViewModel in ko.unwrap(@sets)
               if ko.unwrap(setViewModel.active)
                  set = @dominionSets[ko.unwrap(setViewModel.id)]
                  hasEvents = true if set.events?.length
                  hasLandmarks = true if set.landmarks?.length

            # Check if the current kingdom has any events or landmarks.
            for eventOrLandmark in @eventsAndLandmarks()
               id = ko.unwrap(eventOrLandmark.id)
               hasEvents = true if id and id.indexOf('_event_') != -1
               hasLandmarks = true if id and id.indexOf('_landmark_') != -1
            
            return 'Events and Landmarks' if hasEvents and hasLandmarks
            return 'Events' if hasEvents
            return 'Landmarks' if hasLandmarks
            return ''

      createRandomizeButtonTextObservable: ->
         return ko.computed =>
            allCards = @cards().concat(@eventsAndLandmarks())
            for card in allCards
               return 'Replace!' if card.selected()
            return 'Randomize!'

      createDistributeCostAllowedObservable: ->
         return ko.computed =>
            setIds = @getSelectedSetIds()
            cardCount = 0
            for setId in setIds
               cardCount += @dominionSets[setId].cards.length
            return cardCount >= MIN_CARDS_FOR_DISTRIBUTE_COST

      createPrioritizeSetAllowedObservable: ->
         return ko.computed =>
            return @getSelectedSetIds().length >= MIN_SETS_FOR_PRIORITIZE_OPTION

      createPrioritizeSetOptionsObservable: ->
         return ko.computed =>
            options = []
            for set in @sets()
               if set.active()
                  options.push({name: set.name, value: set.id})
            return options

      createRandomizerOptions: ->
         return new RandomizerOptions()
               .setRequireActionProvider(@randomizerSettings.requireActionProvider())
               .setRequireBuyProvider(@randomizerSettings.requireBuyProvider())
               .setRequireTrashing(@randomizerSettings.requireTrashing())
               .setRequireReactionIfAttacks(@randomizerSettings.requireReaction())
               .setDistributeCost(@distributeCostAllowed() and @randomizerSettings.distributeCost())
               .setPrioritizeSet(
                     (@prioritizeSetAllowed() and @prioritizeSetEnabled() and
                           @randomizerSettings.prioritizeSet()))

      loadOptionsFromSettings: =>
         @settings = SettingsManager.loadSettings()
         @randomizerSettings = @settings.randomizerSettings()

         # Set the active state of the sets.
         selectedSets = @settings.selectedSets()
         for set in @sets()
            set.active(selectedSets.indexOf(set.id) != -1)
            set.active.subscribe(@saveSettings)

         # Setup the prirotized set option.
         @prioritizeSetEnabled(!!@randomizerSettings.prioritizeSet())
         @prioritizeSetEnabled.subscribe(@prioritizeSetEnabledChanged)
         
         # Re-sort the cards when the sort option changes.
         @settings.sortAlphabetically.subscribe(@sortCards)

         # Save the settings when settings change.
         @settings.sortAlphabetically.subscribe(@saveSettings)
         @settings.showSetOnCards.subscribe(@saveSettings)
         @randomizerSettings.requireActionProvider.subscribe(@saveSettings)
         @randomizerSettings.requireBuyProvider.subscribe(@saveSettings)
         @randomizerSettings.allowAttacks.subscribe(@saveSettings)
         @randomizerSettings.requireReaction.subscribe(@saveSettings)
         @randomizerSettings.requireTrashing.subscribe(@saveSettings)
         @randomizerSettings.distributeCost.subscribe(@saveSettings)
         @randomizerSettings.prioritizeSet.subscribe(@saveSettings)

      saveSettings: () =>
         selectedSets = @getSelectedSetIds()
         @settings.selectedSets(selectedSets)
         SettingsManager.saveSettings(@settings)

      prioritizeSetAllowedChanged: =>
         @randomizerSettings.prioritizeSet(null) if !@prioritizeSetAllowed()

      prioritizeSetEnabledChanged: =>
         @randomizerSettings.prioritizeSet(null) if !@prioritizeSetEnabled()

      getCardsToExclude: ->
         # Only exclude cards when at least 3 sets are selected and no sets are prioritized.
         return [] if @randomizerSettings.prioritizeSet()
         setIds = @getSelectedSetIds()
         return [] if setIds.length < 3
         return @extractCardIds(@cards())

      getExcludeTypes: ->
         types = []
         types.push(CardType.ATTACK) unless @randomizerSettings.allowAttacks()
         return types

      extractCardIds: (cards) ->
         return (ko.unwrap(card.id) for card in cards)

      getSelectedSetIds: ->
         return (set.id for set in @sets() when set.active())

      getSelectedSets: ->
         return (set for set in @sets() when set.active())

      getSelectedCards: ->
         return (card for card in @cards() when card.selected())

      getUnselectedCards: ->
         return (card for card in @cards() when !card.selected())

      getSelectedEvents: ->
         selectedEvents = []
         for card in @eventsAndLandmarks()
            id = ko.unwrap(card.id)
            if id and id.indexOf('_event_') != -1 and ko.unwrap(card.selected)
               selectedEvents.push(card)

         return selectedEvents

      getSelectedLandmarks: ->
         selectedLandmarks = []
         for card in @eventsAndLandmarks()
            id = ko.unwrap(card.id)
            if id and id.indexOf('_landmark_') != -1 and ko.unwrap(card.selected)
               selectedLandmarks.push(card)
         return selectedLandmarks

      getSelectedUndefinedEventOrLandmarks: ->
         selectedUndefinedEventOrLandmark = []
         for card in @eventsAndLandmarks()
            if ko.unwrap(card.isLoading) and ko.unwrap(card.selected)
               selectedUndefinedEventOrLandmark.push(card)
         return selectedUndefinedEventOrLandmark

      updateUrlForKingdom: (kingdom) ->
         url = new URL(location.href)
         url.search = Serializer.serializeKingdom(kingdom)
         history.replaceState({}, '', url.href)

      loadCardBacks: => 
         start = Date.now()
         remaining = 2
         handleLoaded = =>
            return unless --remaining == 0
            if (left = 500 - (Date.now() - start)) > 0
               setTimeout (=> @hasLoaded(true)), left
            else @hasLoaded(true)
         $.imgpreload(CardViewModel.VERTICAL_LOADING_IMAGE_URL, handleLoaded)
         $.imgpreload(CardViewModel.HORIZONTAL_LOADING_IMAGE_URL, handleLoaded)

      sortCards: =>
         isEnlarged = @isEnlarged() and @isCondensed()
         $body = $('body')
         cards = @cards()
         $cards = $('#cards').find('.card-wrap .card-front')
         pairs = []
         for card, index in cards
            pairs.push({ card: card, element: $($cards[index]) })
         
         pairs.sort(@cardPairSorter)
         
         movedPairs = []
         for pair, pairIndex in pairs
            for card, cardIndex in cards
               if card == pair.card and pairIndex != cardIndex
                  pair.movedFrom = pair.element.offset()
                  pair.movedTo = $($cards[pairIndex]).offset()
                  movedPairs.push(pair)
            
         for p in movedPairs
            do (pair = p) ->
               pair.clone = pair.element.clone(false)
               tX = pair.movedTo.left - pair.movedFrom.left
               tY = pair.movedTo.top - pair.movedFrom.top
               setVenderProp = (obj, prop, val) ->
                  obj['-webkit-'+prop] = val
                  obj['-moz-'+prop] = val
                  obj[prop] = val
                  return obj

               # Build all the css required
               css = {
                  position: 'absolute'
                  height: pair.element.height()
                  width: pair.element.width()
                  top: pair.movedFrom.top
                  left: pair.movedFrom.left
                  'z-index': 250
                  'transition-property': '-webkit-transform, -webkit-filter, opacity'
                  'transition-property': '-moz-transform, -moz-filter, opacity'
               }
               
               setVenderProp(css, 'transition-timing-function', 'ease-in-out')
               setVenderProp(css, 'transition-duration', '600ms')
               setVenderProp(css, 'transition-delay', 0)
               setVenderProp(css, 'filter', 'none')
               setVenderProp(css, 'transition', 'transform 600ms ease-in-out')
               setVenderProp(css, 'transform', "translate(0px,0px)")

               # Set up everything for the animation
               pair.clone.addClass('enlarge-cards') if isEnlarged
               pair.clone.appendTo($body).css(css)
               pair.element.css('visibility', 'hidden')
               pair.clone.bind 'webkitTransitionEnd transitionend otransitionend oTransitionEnd', ->
                  pair.element.css('visibility', 'visible')
                  pair.clone.remove()
               
               # This timeout is required so that the animation actually takes place
               setTimeout ->
                  pair.clone.css(setVenderProp({}, 'transform', "translate(#{tX}px,#{tY}px)"))
               , 0

         # Sort all the cards while the ones that will change position are moving
         @cards.sort(@cardSorter)

      cardPairSorter: (a, b) => return @cardSorter(a.card, b.card)
      cardSorter: (a, b) =>
         unless @settings.sortAlphabetically()
            return -1 if ko.unwrap(a.setId) < ko.unwrap(b.setId)
            return 1 if ko.unwrap(a.setId) > ko.unwrap(b.setId)
         return -1 if ko.unwrap(a.name) < ko.unwrap(b.name)
         return 1 if ko.unwrap(a.name) > ko.unwrap(b.name)
         return 0


   window.IndexViewModel = IndexViewModel