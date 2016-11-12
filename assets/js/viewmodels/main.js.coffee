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
         @sets = ko.observableArray(new SetViewModel(set, true) for setId, set of @dominionSets)
         @cards = ko.observableArray(new CardViewModel(@) for i in [0...10])
         @eventsAndLandmarks = ko.observableArray(new CardViewModel(@, false) for i in [0...2])
         @requireActionProvider = ko.observable(true)
         @requireBuyProvider = ko.observable(true)
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
         @loadCardBacks()

      fetchKingdom: () =>
         selectedCards = (card for card in @cards() when card.selected())
         nonSelectedCardIds = (ko.unwrap(card.id) for card in @cards() when !card.selected())

         # If there are cards selected, show dialog so user can filter
         if selectedCards.length > 0
            @dialog.open () =>
               options = {
                  setIds: (ko.unwrap(set.id) for set in @dialog.sets when set.active())
                  includeCardIds: nonSelectedCardIds
                  excludeCardIds: (ko.unwrap(card.id) for card in selectedCards)
                  includeEventIds: (event.id for event in @kingdom.events)
                  includeLandmarkIds: (landmark.id for landmark in @kingdom.landmarks)
                  excludeTypes: (ko.unwrap(type.id) for type in @dialog.types when !type.active())
                  allowedCosts: (ko.unwrap(costs.id) for costs in @dialog.costs when costs.active())
               }

               # Set cards to loading and get the new cards.
               card.setToLoading() for card in selectedCards
               result = Randomizer.createKingdom(@dominionSets, options)
               
               # TODO: Implement reshuffling the events and landmarks.
               @kingdom.cards = result.kingdom.cards
               sets = @sets()
               imagesLeftToLoad = selectedCards.length
               
               # Use this function to sync all of the images so that the sort
               # only happens after all have loaded
               registerComplete = => 
                  if --imagesLeftToLoad <= 0 
                     setTimeout((=> @sortCards()), CardViewModel.ANIMATION_TIME)
               
               nextSelectedCardIndex = 0
               for cardData in @kingdom.cards
                  # If this is a new card then set an old card to have the new data
                  # and then animate the sorting after all have loaded
                  if (nonSelectedCardIds.indexOf(cardData.id) == -1 and
                        nextSelectedCardIndex < selectedCards.length)
                     selectedCards[nextSelectedCardIndex++].setData(cardData, sets)
                     if card.cardImageLoaded()
                        registerComplete()
                     else
                        # Capture the subscription so we can dispose after the image loads.
                        do =>
                           subscription = card.cardImageLoaded.subscribe (val) =>
                              return unless val
                              subscription.dispose()
                              registerComplete()

               @metadata.update(result.metadata)
         else 
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
            result = Randomizer.createKingdom(@dominionSets, {
               setIds: setIds,
               excludeCardIds: @getCardsToExclude()
               excludeTypes: @getExcludeTypes()
               requireActionProvider: @requireActionProvider()
               requireBuyProvider: @requireBuyProvider()
               requireReactionIfAttackCards: @requireReaction()
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
      
      createShowEventsAndLandmarksObservable: ->
         return ko.computed =>
            return false unless @hasLoaded()
            for setViewModel in ko.unwrap(@sets)
               if ko.unwrap(setViewModel.active)
                  set = @dominionSets[ko.unwrap(setViewModel.id)]
                  if set.events?.length or set.landmarks?.length
                     return true
            return false

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

      saveOptionsToCookie: (options) => $.cookie('options', options)

      getCardsToExclude: ->
         numberOfCardsInSelectedSets = 0
         setIds = (set.id for set in @sets() when set.active())
         return [] unless setIds > 2
         return (card.id for card in @cards())

      getExcludeTypes: ->
         types = []
         types.push(Randomizer.Type.ATTACK) unless @allowAttackCards()
         return types

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