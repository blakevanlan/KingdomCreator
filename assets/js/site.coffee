
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
      @keep = ko.observable(false)
      
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
      @fetchCards()

   getOptions: () =>
      options = {
         sets: (set.id for set in @sets() when set.active()).join(',')
         cards: (card.id for card in @cards() when card.keep()).join(',')
      }
      delete options.cards unless options.cards
      return options

   fetchCards: () =>
      @isLoading(true)
      options = @getOptions()
      $.getJSON '/randomCards', options, (data) =>
         @isLoading(false)
         @cards(new window.Card(card, @sets()) for card in data)
         # Reselect cards that were kept
         if options.cards
            cards = @cards()
            for id in options.cards.split(',')
               for card in cards
                  if card.id == id
                     card.keep(true)
                     break


$(document).ready () ->
   vm = new window.ViewModel(window.sets)
   ko.applyBindings(vm)