#= require lib/jquery.js
#= require lib/jquery.cookie.js
#= require lib/knockout.js
#= require lib/vex.combined.min.js
#= require ext/binding-handlers.coffee

vex.defaultOptions.className = 'vex-theme-os'

# Constants
MOBILE_WIDTH = 600
REMAPPED_NAMES = { 'knights': 'dameanna' }
LOADING_IMAGE_URL = '/img/cards/backside_blue.jpg'

lower = (str) -> if str then str.replace(/[\s'-]/g, '').toLowerCase() else ''
getImageUrl = (set, name) ->
   name = lower(name)
   name = REMAPPED_NAMES[name] if (REMAPPED_NAMES[name])
   return "/img/cards/#{lower(set)}_#{name}.jpg"

# Dialog methods
vexDialogId = null
closeDialog = () -> vex.close(vexDialogId) if vexDialogId
openDialog = () ->
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
      @name = ko.observable()
      @set = ko.observable()
      @isLoading = ko.observable(true)
      @keep = ko.observable(true)

      # Build the image URL
      @cardImageUrl = ko.computed () => getImageUrl(@set(), @name())
      @imageUrl = ko.computed () =>
         if @isLoading() then LOADING_IMAGE_URL else @cardImageUrl()
      @setClass = ko.computed () =>
         if @isLoading() then 'loading' else lower(@set())

   setData: (data, sets) =>
      @id = data._id
      @name(data.name)
      
      # Set the name of the set
      for set in sets
         if set.id == data.set
            @set(set.name)
            break
      # @cost = data.cost
      # @description = data.description
      # @isAttack = data.isAttack
      # @isAction = data.isAction
      # @isTreasure = data.isTreasure
      # @isVictory = data.isVictory
      # @isTrashing = data.isTrashing
      # @isReaction = data.isReaction
      @isLoading(false)

   openDialog: () => @parent.dialogControl.open(@)

   fetchNewCard: () =>
      @isLoading(true)
      options =
         sets: (s.id for s in @parent.dialogControl.sets when s.active()).join(',')
         cards: (c.id for c in @parent.cards() when @id != c.id).join(',')
         types: (t.id for t in @parent.dialogControl.types when t.active()).join(',')
      
      $.getJSON '/cards/single', options, (data) =>
         @setData(data, @parent.sets())

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
      @cardReference = null

      # Watch for changes on the main sets and atomatically apply changes to
      # dialog
      for set in allSets()
         do (cset = set) =>
            cset.active.subscribe (val) => 
               for s in @sets
                  if s.id == cset.id
                     s.active(val)
                     break

   fetchNewCard: () =>
      @cardReference.fetchNewCard()
      @close()

   open: (card) => 
      @cardReference = card
      openDialog()
   
   close: () -> 
      closeDialog()
      @cardReference = null

   createTypes: ->
      return [
         new window.CardType('+2 Actions'), new window.CardType('+1 Buy'),
         new window.CardType('Attack'), new window.CardType('Reaction'),
         new window.CardType('Trashing'), new window.CardType('Treasure'),
         new window.CardType('Victory')
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

   getOptions: () =>
      options = {
         sets: (set.id for set in @sets() when set.active()).join(',')
      }
      if not options.cards or not options.cards.length or options.cards.length >= 10
         delete options.cards
      else options.cards = options.cards.join(',')
      return options

   fetchKingdom: () =>
      options = @getOptions()
      @saveOptionsToCookie(options)
      card.isLoading(true) for card in @cards()

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

$(document).ready () ->
   $.cookie.json = true
   vm = new window.ViewModel(window.sets)
   ko.applyBindings(vm)
   $(window).resize () -> vm.isMobile($(window).width() <= MOBILE_WIDTH)
