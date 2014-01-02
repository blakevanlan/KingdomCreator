MOBILE_WIDTH = 600

remappedNames = 
   'knights': 'dameanna'

lower = (str) -> return str.replace(/[\s'-]/g, '').toLowerCase()
getImageUrl = (set, name) ->
   name = lower(name)
   name = remappedNames[name] if (remappedNames[name])
   return "/img/cards/#{lower(set)}_#{name}.jpg"
   
class window.Set
   constructor: (data) ->
      @id = data._id
      @name = data.name
      @active = ko.observable(true)

class window.Card
   constructor: (data, sets) ->
      @id = data._id
      @name = data.name
      @cost = data.cost
      @description = data.description
      @isAttack = data.isAttack
      @isAction = data.isAction
      @isTreasure = data.isTreasure
      @isVictory = data.isVictory
      @isTrashing = data.isTrashing
      @isReaction = data.isReaction
      @keep = ko.observable(true)
      
      # Set the name of the set
      for set in sets
         if set.id == data.set
            @set = set.name
            break
      # Build the image URL
      @imageUrl = getImageUrl(@set, @name)
      @setClass = lower(@set)

   toggleKeep: () =>
      @keep(!@keep())

class window.Meta
   constructor: () ->
      @useColonies = ko.observable(false)
      @useShelters = ko.observable(false)
      @show = ko.computed () => return @useColonies or @useShelters()

   update: (data) ->
      @useColonies(data.useColonies or false)
      @useShelters(data.useShelters or false)

class window.ViewModel
   constructor: (sets) ->
      @cards = ko.observableArray()
      @sets = ko.observableArray(new window.Set(set) for set in sets)
      @isLoading = ko.observable(false)
      @showSet = ko.observable(true)
      @isMobile = ko.observable($(window).width() <= MOBILE_WIDTH)
      @showFloatingButton = ko.observable(false)
      @meta = new window.Meta()
      @loadOptionsFromCookie()
      @fetchCards()

   getOptions: () =>
      options = {
         sets: (set.id for set in @sets() when set.active()).join(',')
         cards: card.id for card in @cards() when card.keep()
      }
      if not options.cards or not options.cards.length or options.cards.length >= 10
         delete options.cards
      else options.cards = options.cards.join(',')
      return options

   fetchCards: () =>
      @isLoading(true)
      options = @getOptions()
      @saveOptionsToCookie(options);

      $.getJSON '/randomCards', options, (data) =>
         @isLoading(false)
         @cards(new window.Card(card, @sets()) for card in data.kingdom)
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

$(document).ready () ->
   $.cookie.json = true
   vm = new window.ViewModel(window.sets)
   ko.applyBindings(vm)
   
   $win = $(window)
   $staticButton = $('#staticButton')
   # Check if view is mobile based on size
   $win.resize () ->
      vm.isMobile($(window).width() <= MOBILE_WIDTH)
   
   # Check if the floating button should be shown
   $win.scroll () ->
      console.log 'scrollTop', $win.scrollTop()
      # console.log 'staticButtonOffset.top', staticButtonOffset.top

      if !vm.isMobile() then vm.showFloatingButton(false)
      else vm.showFloatingButton($win.scrollTop() > $staticButton.offset().top)
