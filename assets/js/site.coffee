
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
      @keep = ko.observable()
      
      for set in sets
         if set.id == data.set
            @set = set.name
            break


class window.ViewModel
   constructor: (sets) ->
      @cards = ko.observableArray()
      @sets = ko.observableArray(new window.Set(set) for set in sets)
      @isLoading = ko.observable(false)
      @fetchCards()

   getOptions: () =>
      options = {
         sets: (set.id for set in @sets() when set.active()).join(',')
         cards: (card.id for card in @cards() when card.keep()).join(',')
      }
      delete options.cards unless options.cards
      console.log options
      return options

   fetchCards: (options) =>
      @isLoading(true)
      $.getJSON '/randomCards', @getOptions(), (data) =>
         @isLoading(false)
         @cards(new window.Card(card, @sets()) for card in data)


$(document).ready () ->
   vm = new window.ViewModel(window.sets)
   ko.applyBindings(vm)