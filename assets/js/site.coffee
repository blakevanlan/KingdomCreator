#= require lib/jquery.js
#= require lib/jquery.cookie.js
#= require lib/jquery.imgpreload.min.js
#= require lib/knockout.js
#= require lib/vex.combined.min.js
#= require ext/binding-handlers.coffee

vex.defaultOptions.className = 'vex-theme-os'

# Constants
MOBILE_WIDTH = 600
ANIMATION_TIME = 600#ms
REMAPPED_NAMES = { 'knights': 'dameanna' }
LOADING_IMAGE_URL = '/img/cards/backside_blue.jpg'

lower = (str) -> if str then str.replace(/[\s'-]/g, '').toLowerCase() else ''
getImageUrl = (set, name) ->
   name = lower(name)
   name = REMAPPED_NAMES[name] if (REMAPPED_NAMES[name])
   return "/img/cards/#{lower(set)}_#{name}.jpg"

sortCards = (cardsObservableArray) ->
   $body = $('body')
   cards = cardsObservableArray()
   $cards = $('#cards').find('.card-wrap .card-front')
   pairs = []
   for card, index in cards
      pairs.push({ card: card, element: $($cards[index]) })
   
   pairs.sort(cardPairSorter)
   
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
         css =
            position: 'absolute'
            height: pair.element.height()
            width: pair.element.width()
            top: pair.movedFrom.top
            left: pair.movedFrom.left
            'transition-property': '-webkit-transform, -webkit-filter, opacity'
            'transition-property': '-moz-transform, -moz-filter, opacity'
         
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
   cardsObservableArray.sort(cardSorter)


cardPairSorter = (a, b) -> return cardSorter(a.card, b.card)
cardSorter = (a, b) ->
   return -1 if a.setId < b.setId
   return 1 if a.setId > b.setId
   return -1 if a.name() < b.name()
   return 1 if a.name() > b.name()
   return 0


# Dialog methods
vexDialogId = null
closeDialog = -> vex.close(vexDialogId) if vexDialogId
openDialog = ->
   $content = null
   $dialog = vex.open
      afterOpen: ($vexContent) ->
         $content = $('.dialog-hidden-content .dialog-content').first().detach()
         $vexContent.append $content
      beforeClose: ->
         $content.detach().appendTo($('.dialog-hidden-content'))
      afterClose: ->
         vexDialogId = null
   vexDialogId = $dialog.data().vex.id

class window.CardType
   constructor: (data) ->
      if typeof(data) == 'string'
         @name = data
         @id = lower(@name)
      else
         @name = data.name
         @id = data.id
      @active = ko.observable(true)
   
class window.Set
   constructor: (data) ->
      @id = data._id or data.id
      @name = data.name
      @active = ko.observable(if data.active? then data.active else true)
   
   toObject: () =>
      return {
         id: @id
         name: @name
         active: @active()
      }


class window.Card
   constructor: (parent) ->
      @parent = parent
      @id = null
      @setId = null
      @name = ko.observable()
      @set = ko.observable()
      @isLoading = ko.observable(true)
      @cardImageLoaded = ko.observable(false)
      @animationStartTime = null
      @selected = ko.observable(false)

      # Build the image URL
      @imageUrl = ko.observable(LOADING_IMAGE_URL)
      @setClass = ko.computed () =>
         if @isLoading() then 'loading' else lower(@set())

   setData: (data, sets) =>
      @id = data._id
      @name(data.name)
      @setId = data.set
      
      # Set the name of the set
      for set in sets
         if set.id == data.set
            @set(set.name)
            break

      @imageUrl(getImageUrl(@set(), @name()))
      @isLoading(false)
      @cardImageLoaded(false)
      $.imgpreload @imageUrl(), =>
         # Delay showing image until transition is complete
         if (left = ANIMATION_TIME - (new Date() - @animationStartTime)) > 0
            setTimeout (=> @setCardLoaded()), left
         else @setCardLoaded()

   failedToLoad: =>
      @isLoading(false)
      @cardImageLoaded(false)
      if (left = ANIMATION_TIME - (new Date() - @animationStartTime)) > 0
         setTimeout (=> @cardImageLoaded(true)), left
      else @cardImageLoaded(true)
         
   setToLoading: =>
      @selected(false)
      @isLoading(true)
      @animationStartTime = new Date()

   setCardLoaded: =>
      @cardImageLoaded(true)
      setTimeout (=> sortCards(@parent.cards)), ANIMATION_TIME
   
   toggleSelected: () => @selected(!@selected())


class window.Meta
   constructor: () ->
      @useColonies = ko.observable(false)
      @useShelters = ko.observable(false)
      @show = ko.computed () => return @useColonies or @useShelters()

   update: (data) ->
      @useColonies(data.useColonies or false)
      @useShelters(data.useShelters or false)

class window.DialogControl
   constructor: (allSets) ->
      # Create new set objects so they can be clicked on 
      @sets = (new window.Set(set.toObject()) for set in allSets())
      @types = @createTypes()
      @costs = @createCosts()
      @callback = null

      @openSetsSection = ko.observable(false)
      @openTypesSection = ko.observable(false)
      @openCostsSection = ko.observable(false)

      # Watch for changes on the main sets and atomatically apply changes to
      # dialog
      for set in allSets()
         do (cset = set) =>
            cset.active.subscribe (val) => 
               for s in @sets
                  if s.id == cset.id
                     s.active(val)
                     break

   toggleSetsSection: => @openSetsSection(!@openSetsSection())
   toggleTypesSection: => @openTypesSection(!@openTypesSection())
   toggleCostsSection: => @openCostsSection(!@openCostsSection())

   fetchNewCards: () =>
      @callback()
      @close()

   open: (callback) => 
      @callback = callback
      openDialog()
   
   close: () -> 
      closeDialog()
      @callback = null

   createTypes: ->
      return [
         new window.CardType('+2 Actions'), new window.CardType('+1 Buy'),
         new window.CardType('Attack'), new window.CardType('Reaction'),
         new window.CardType('Trashing'), new window.CardType('Treasure'),
         new window.CardType('Victory')
      ]

   createCosts: ->
      return [
         new window.CardType({ id: 'cost2', name: '2' })
         new window.CardType({ id: 'cost5', name: '5' })
         new window.CardType({ id: 'cost3', name: '3' })
         new window.CardType({ id: 'cost4', name: '4' })
         new window.CardType({ id: 'cost6', name: '6' })
         new window.CardType({ id: 'cost7+', name: '7+' })
      ]


class window.ViewModel
   constructor: (sets) ->
      @cards = ko.observableArray(new Card(@) for i in [0...10])
      @sets = ko.observableArray(new window.Set(set) for set in sets)
      @showSet = ko.observable(true)
      @isMobile = ko.observable($(window).width() <= MOBILE_WIDTH)
      @loadOptionsFromCookie()
      @meta = new window.Meta()
      @dialogControl = new window.DialogControl(@sets)
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
         @dialogControl.open () =>
            options =
               sets: (s.id for s in @dialogControl.sets when s.active()).join(',')
               replaceCards: (c.id for c in selectedCards).join(',')
               keepCards: (c.id for c in nonSelectedCards).join(',')

            # Add types if not all are selected
            types = []
            activeTypes = (t.id for t in @dialogControl.types when t.active())
            activeCosts = (c.id for c in @dialogControl.costs when c.active())
            if activeTypes.length < @dialogControl.types.length
               types.push(type) for type in activeTypes
            if activeCosts.length < @dialogControl.costs.length
               types.push(cost) for cost in activeCosts
            
            options.types = types.join(',') if types.length > 0
            
            # Set cards to loading and get new cards
            card.setToLoading() for card in selectedCards
            jqxhr = $.getJSON '/cards/kingdom', options, (data) =>
               index = 0
               sets = @sets()
               imagesLeftToLoad = selectedCards.length
               
               # Use this function to sync all of the images so that the sort
               # only happens after all have loaded
               registerComplete = => 
                  if --imagesLeftToLoad <= 0 
                     setTimeout (=> sortCards(@cards)), ANIMATION_TIME
               
               for cardData in data.kingdom
                  isNew = true
                  for card in nonSelectedCards
                     if cardData._id == card.id
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

               @meta.update(data.meta)
            # Handle if an error occurs while loading new cards
            jqxhr.fail () => card.failedToLoad() for card in selectedCards

      else 
         options = sets: (set.id for set in @sets() when set.active()).join(',')
         @saveOptionsToCookie(options)
         card.setToLoading() for card in @cards()
         $.getJSON '/cards/kingdom', options, (data) =>
            index = 0
            cards = @cards()
            sets = @sets()
            cards[index++].setData(card, sets) for card in data.kingdom
            @meta.update(data.meta)

   loadOptionsFromCookie: () =>
      options = $.cookie('options')
      if options
         selectedSets = options.sets.split(',')
         for set in @sets()
            set.active(false)
            for selectedSet in selectedSets
               if set.id == selectedSet
                  set.active(true)
                  break

   saveOptionsToCookie: (options) => $.cookie('options', { sets: options.sets })
   loadCardBack: => 
      start = new Date
      $.imgpreload LOADING_IMAGE_URL, =>
         if (left = 500 - (new Date() - start)) > 0
            setTimeout (=> @hasLoaded(true)), left
         else @hasLoaded(true)

$(document).ready () ->
   $.cookie.json = true
   vm = new window.ViewModel(window.sets)
   ko.applyBindings(vm)
   $(window).resize () -> vm.isMobile($(window).width() <= MOBILE_WIDTH)
