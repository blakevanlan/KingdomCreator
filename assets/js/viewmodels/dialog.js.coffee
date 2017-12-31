#= require lib/all.js
#= require models/card-cost.js.coffee
#= require models/card-type.js.coffee
#= require viewmodels/set.js.coffee

vex.defaultOptions.className = 'vex-theme-os'

do ->
   CardCost = window.CardCost
   CardType = window.CardType
   SetViewModel = window.SetViewModel

   class CardType
      constructor: (data) ->
         @id = data.id
         @name = data.name
         @active = ko.observable(true)

   class DialogViewModel
      constructor: (allSets) ->
         # Create new set objects so they can be clicked on 
         @sets = (new SetViewModel(set.toObject()) for set in allSets)
         @types = @createTypes()
         @selectedType = ko.observable(CardType.NONE)
         @costs = @createCosts()
         @vexDialogId = null
         @callback = null

         @openSetsSection = ko.observable(false)
         @openTypesSection = ko.observable(false)
         @openCostsSection = ko.observable(false)

         # Watch for changes on the main sets and atomatically apply changes to
         # dialog
         for set in allSets
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

      open: (options, callback) => 
         @callback = callback
         @setDefaults(options)
         $content = null
         $dialog = vex.open
            afterOpen: ($vexContent) ->
               $content = $('.dialog-hidden-content .dialog-content').first().detach()
               $vexContent.append $content
            beforeClose: ->
               $content.detach().appendTo($('.dialog-hidden-content'))
            afterClose: =>
               @vexDialogId = null
         @vexDialogId = $dialog.data().vex.id
      
      setDefaults: (options = {}) =>
         if options.typeStates
            for cardType in @types
               if typeof options.typeStates[cardType.id] == 'boolean'
                  cardType.active(options.typeStates[cardType.id])

      close: () => 
         return unless @vexDialogId
         vex.close(@vexDialogId)
         @callback = null

      createTypes: ->
         return [
            new CardType({ id: CardType.NONE, name: 'Any' })
            new CardType({ id: CardType.DRAWER, name: '+ Cards' })
            new CardType({ id: CardType.BUY_SUPPLIER, name: '+1 Buy' })
            new CardType({ id: CardType.ACTION_SUPPLIER, name: '+2 Actions' })
            new CardType({ id: CardType.ACTION, name: 'Action' })
            new CardType({ id: CardType.ATTACK, name: 'Attack' })
            new CardType({ id: CardType.DURATION, name: 'Duration' })
            new CardType({ id: CardType.REACTION, name: 'Reaction' })
            new CardType({ id: CardType.RESERVE, name: 'Reserve' })
            new CardType({ id: CardType.TRASHING, name: 'Trashing' })
            new CardType({ id: CardType.TREASURE, name: 'Treasure' })
            new CardType({ id: CardType.VICTORY, name: 'Victory' })
         ]

      createCosts: ->
         return [
            new CardType({ id: CardCost.TREASURE_2, name: '1-2' })
            new CardType({ id: CardCost.TREASURE_3, name: '3' })
            new CardType({ id: CardCost.TREASURE_4, name: '4' })
            new CardType({ id: CardCost.TREASURE_5, name: '5' })
            new CardType({ id: CardCost.TREASURE_6, name: '6' })
            new CardType({ id: CardCost.TREASURE_7, name: '7' })
            new CardType({ id: CardCost.TREASURE_8, name: '8+' })
         ]


   window.DialogViewModel = DialogViewModel
