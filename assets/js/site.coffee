MOBILE_WIDTH = 600
lower = (str) -> return str.replace(/[\s']/g, '').toLowerCase()

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
      @imageUrl = "/img/cards/#{lower(@set)}_#{lower(@name)}.jpg"
      @setClass = lower(@set)

   toggleKeep: () =>
      @keep(!@keep())


class window.ViewModel
   constructor: (sets) ->
      @cards = ko.observableArray()
      @sets = ko.observableArray(new window.Set(set) for set in sets)
      @isLoading = ko.observable(false)
      @showSet = ko.observable(true)
      @isMobile = ko.observable($(window).width() <= MOBILE_WIDTH)
      @showFloatingButton = ko.observable(false)
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
      $.getJSON '/randomCards', options, (data) =>
         @isLoading(false)
         @cards(new window.Card(card, @sets()) for card in data)
         

$(document).ready () ->
   vm = new window.ViewModel(window.sets)
   ko.applyBindings(vm)
   $(window).resize () -> isMobile($(window).width() <= MOBILE_WIDTH)
