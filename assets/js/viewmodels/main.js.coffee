#= require lib/all.js
#= require randomizer/randomizer.js.coffee
#= require viewmodels/card.js.coffee
#= require viewmodels/dialog.js.coffee
#= require viewmodels/metadata.js.coffee
#= require viewmodels/set.js.coffee

do ->
   CardViewModel = window.CardViewModel
   DialogViewModel = window.DialogViewModel
   MetadataViewModel = window.MetadataViewModel
   SetViewModel = window.SetViewModel

   Randomizer = window.Randomizer

   class MainViewModel
      constructor: (dominionSets) ->
         @dominionSets = dominionSets
         @kingdom = null
         @sets = ko.observableArray(@createSetViewModels())
         @cards = ko.observableArray(new CardViewModel(@) for i in [0...10])
         @eventsAndLandmarks = ko.observableArray(new CardViewModel(@, false) for i in [0...2])
         @requireActionProvider = ko.observable(true)
         @requireBuyProvider = ko.observable(false)
         @allowAttackCards = ko.observable(true)
         @requireReaction = ko.observable(false)
         @showSet = ko.observable(true)
         @sortAlphabetically = ko.observable(false)
         @sortAlphabetically.subscribe(@sortCards)
         @isMobile = ko.observable()
         @loadOptionsFromCookie()
         @metadata = new MetadataViewModel()
         @dialog = new DialogViewModel(@sets())
         @fetchKingdom()
         @hasLoaded = ko.observable(false)
         @showEventsAndLandmarks = @createShowEventsAndLandmarksObservable()
         @eventsAndLandmarksHeader = @createEventsAndLandmarksHeaderObservable()
         @randomizeButtonText = @createRandomizeButtonTextObservable()
         @firstDialogOpenSinceFullRandomize = false
         @loadCardBacks()

      fetchKingdom: () =>
         selectedCards = (card for card in @cards() when card.selected())
         nonSelectedCardIds = (ko.unwrap(card.id) for card in @cards() when !card.selected())
         selectedEvents = @getSelectedEvents()
         selectedLandmarks = @getSelectedLandmarks()
         nonSelectedEventAndLandmarkIds = (ko.unwrap(card.id) for card in @eventsAndLandmarks() when !card.selected())

         # If there are cards selected, show dialog so user can filter.
         if selectedCards.length or selectedEvents.length or selectedLandmarks.length
            randomizeSelectedCards = =>
               options = {
                  setIds: (ko.unwrap(set.id) for set in @dialog.sets when set.active())
                  includeCardIds: nonSelectedCardIds
                  excludeCardIds: (ko.unwrap(card.id) for card in selectedCards)
                  includeEventIds: (event.id for event in @kingdom.events)
                  includeLandmarkIds: (landmark.id for landmark in @kingdom.landmarks)
                  excludeTypes: (ko.unwrap(type.id) for type in @dialog.types when !type.active())
                  allowedCosts: (ko.unwrap(costs.id) for costs in @dialog.costs when costs.active())
                  eventIdsToReplace: (ko.unwrap(card.id) for card in selectedEvents)
                  landmarkIdsToReplace: (ko.unwrap(card.id) for card in selectedLandmarks)
                  fillKingdomEventsAndLandmarks: false
               }
               result = Randomizer.createKingdom(@dominionSets, options)
               return unless result
               
               # Set cards to loading and get the new cards.
               card.setToLoading() for card in selectedCards
               card.setToLoading() for card in selectedEvents
               card.setToLoading() for card in selectedLandmarks

               @kingdom = result.kingdom
               sets = @sets()
               imagesLeftToLoad = selectedCards.length + selectedEvents.length + selectedLandmarks.length
               
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
               for cardData in @kingdom.cards
                  if (nonSelectedCardIds.indexOf(cardData.id) == -1 and
                        nextSelectedCardIndex < selectedCards.length)
                     setCardData(selectedCards[nextSelectedCardIndex++], cardData)

               nextIndex = 0
               selectedEventsAndLandmarks = selectedEvents.concat(selectedLandmarks)
               eventsAndLandmarks = @kingdom.events.concat(@kingdom.landmarks)
               for cardData in eventsAndLandmarks
                  if (nonSelectedEventAndLandmarkIds.indexOf(cardData.id) == -1 and
                        nextIndex < selectedEventsAndLandmarks.length)
                     setCardData(selectedEventsAndLandmarks[nextIndex++], cardData)

            # Only show the dialog when a card is selected (not for events or landmarks).
            if selectedCards.length
               dialogOptions = {typeStates: {}}

               # Set the dialog options to match the randomized kingdom the first time the
               # user opens the dialog since randomizing.
               if @firstDialogOpenSinceFullRandomize
                  dialogOptions.typeStates[Randomizer.Type.ATTACK] = @allowAttackCards()

               @firstDialogOpenSinceFullRandomize = false
               @dialog.open(dialogOptions, randomizeSelectedCards)
            else 
               randomizeSelectedCards()
               
         else 
            @firstDialogOpenSinceFullRandomize = true
            setIds = (set.id for set in @sets() when set.active())
            @saveOptionsToCookie({
               sets: setIds.join(',')
               sortAlphabetically: @sortAlphabetically()
               showSet: @showSet()
               requireActionProvider: @requireActionProvider()
               requireBuyProvider: @requireBuyProvider()
               allowAttackCards: @allowAttackCards()
               requireReaction: @requireReaction()
            })
            card.setToLoading() for card in @cards()
            card.setToLoading() for card in @eventsAndLandmarks()

            # Bail if no sets are selected.
            return unless setIds.length

            result = Randomizer.createKingdom(@dominionSets, {
               setIds: setIds,
               excludeCardIds: @getCardsToExclude()
               excludeTypes: @getExcludeTypes()
               requireActionProvider: @requireActionProvider()
               requireBuyProvider: @requireBuyProvider()
               requireReactionIfAttackCards: @requireReaction()
               fillKingdomEventsAndLandmarks: true
            })
            @kingdom = result.kingdom
            @kingdom.cards.sort(@cardSorter)

            cards = @cards()
            sets = @sets()
            for card, index in @kingdom.cards
               cards[index].setData(card, sets)
            for eventOrLandmark, index in @eventsAndLandmarks()
               if index < @kingdom.events.length
                  eventOrLandmark.setData(@kingdom.events[index], sets)
                  continue
               landmarkIndex = index - @kingdom.events.length
               if landmarkIndex < @kingdom.landmarks.length
                  eventOrLandmark.setData(@kingdom.landmarks[landmarkIndex], sets)
                  continue
               else
                  eventOrLandmark.setToLoading()

            @metadata.update(result.metadata)
      
      createSetViewModels:  ->
         sets = (set for setId, set of @dominionSets)
         sets.sort (a, b) ->
            return 0 if a.name == b.name
            return if a.name < b.name then -1 else 1

         return (new SetViewModel(set, true) for set in sets)

      createShowEventsAndLandmarksObservable: ->
         return ko.computed =>
            return false unless @hasLoaded()
            for setViewModel in ko.unwrap(@sets)
               if ko.unwrap(setViewModel.active)
                  set = @dominionSets[ko.unwrap(setViewModel.id)]
                  if set.events?.length or set.landmarks?.length
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

      loadOptionsFromCookie: =>
         options = $.cookie('options')
         if options
            if options.sets
               selectedSets = options.sets.split(',')
               if selectedSets.length
                  for set in @sets()
                     set.active(selectedSets.indexOf(set.id) != -1)

            @sortAlphabetically(!!options.sortAlphabetically)
            @showSet(!!options.showSet)
            @requireActionProvider(!!options.requireActionProvider)
            @requireBuyProvider(!!options.requireBuyProvider)
            @allowAttackCards(!!options.allowAttackCards)
            @requireReaction(!!options.requireReaction)

         else
            # Set default all of the sets but base set to disabled.
            for set in @sets()
               set.active(ko.unwrap(set.id) == 'baseset')

      saveOptionsToCookie: (options) => $.cookie('options', options, {expires: 365})

      getCardsToExclude: ->
         numberOfCardsInSelectedSets = 0
         setIds = (set.id for set in @sets() when set.active())
         return [] unless setIds > 2
         return (card.id for card in @cards())

      getExcludeTypes: ->
         types = []
         types.push(Randomizer.Type.ATTACK) unless @allowAttackCards()
         return types

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
         unless @sortAlphabetically()
            return -1 if ko.unwrap(a.setId) < ko.unwrap(b.setId)
            return 1 if ko.unwrap(a.setId) > ko.unwrap(b.setId)
         return -1 if ko.unwrap(a.name) < ko.unwrap(b.name)
         return 1 if ko.unwrap(a.name) > ko.unwrap(b.name)
         return 0


   window.MainViewModel = MainViewModel