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
         @cards = ko.observableArray(new CardViewModel(@) for i in [0...10])
         @sets = ko.observableArray(new SetViewModel(set) for setId, set of @dominionSets)
         @showSet = ko.observable(true)
         @sortAlphabetically = ko.observable(false)
         @sortAlphabetically.subscribe(@sortCards)
         @isMobile = ko.observable()
         @loadOptionsFromCookie()
         @metadata = new MetadataViewModel()
         @dialog = new DialogViewModel(@sets())
         @fetchKingdom()
         @hasLoaded = ko.observable(false)
         @loadCardBack()

      fetchKingdom: () =>
         # Find any cards that are selected
         selectedCards = []
         nonSelectedCards = []

         for card in @cards()
            if card.selected() then selectedCards.push(card)
            else nonSelectedCards.push(card)

         # If there are cards selected, show dialog so user can filter
         if selectedCards.length > 0
            @dialog.open () =>
               options = {
                  setIds: (set.id for s in @dialog.sets when set.active())
                  includeCardIds: (card.id for card in selectedCards)
                  excludeCardIds: (card.id for card in nonSelectedCards)
                  allowedTypes: (type.id for type in @dialog.types when type.active())
                  allowedCosts: (costs.id for costs in @dialog.costs when costs.active())
               }

               # Set cards to loading and get the new cards.
               card.setToLoading() for card in selectedCards
               kingdom = Randomizer.createKingdom(@dominionSets, options)
               index = 0
               sets = @sets()
               imagesLeftToLoad = selectedCards.length
               
               # Use this function to sync all of the images so that the sort
               # only happens after all have loaded
               registerComplete = => 
                  if --imagesLeftToLoad <= 0 
                     setTimeout (=> sortCards()), ANIMATION_TIME
               
               for cardData in kingdom.cards
                  isNew = true
                  for card in nonSelectedCards
                     if cardData.id == card.id
                        isNew = false
                        break
                  # If this is a new card then set an old card to have the new data
                  # and then animate the sorting after all have loaded
                  if isNew
                     do (card = selectedCards[index++], data = cardData) =>
                        card.setData(data, sets)
                        
                        if card.cardImageLoaded() then registerComplete()
                        else
                           subscription = card.cardImageLoaded.subscribe (val) =>
                              return unless val
                              subscription.dispose()
                              registerComplete()

               @metadata.update(kingdom.metadata)
         else 
            setIds = (set.id for set in @sets() when set.active())
            @saveOptionsToCookie({
               sets: setIds.join(',')
               sortAlphabetically: @sortAlphabetically()
               showSet: @showSet()
            })
            card.setToLoading() for card in @cards()
            kingdom = Randomizer.createKingdom(@dominionSets, {setIds: setIds})
            kingdom.cards.sort(@cardSorter)

            cards = @cards()
            sets = @sets()
            for card, index in kingdom.cards
               cards[index].setData(card, sets)
            @metadata.update(kingdom.metadata)

      loadOptionsFromCookie: =>
         options = $.cookie('options')
         if options
            if options.sets
               selectedSets = options.sets.split(',')
               for set in @sets()
                  set.active(false)
                  for selectedSet in selectedSets
                     if set.id == selectedSet
                        set.active(true)
                        break
            @sortAlphabetically(!!options.sortAlphabetically)
            @showSet(!!options.showSet)

      saveOptionsToCookie: (options) => $.cookie('options', options)

      loadCardBack: => 
         start = new Date
         $.imgpreload CardViewModel.LOADING_IMAGE_URL, =>
            if (left = 500 - (new Date() - start)) > 0
               setTimeout (=> @hasLoaded(true)), left
            else @hasLoaded(true)

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