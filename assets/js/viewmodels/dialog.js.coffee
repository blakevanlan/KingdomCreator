#= require lib/all.js
#= require models/card-cost.js.coffee
#= require models/card-type.js.coffee
#= require viewmodels/set.js.coffee

vex.defaultOptions.className = 'vex-theme-os'

do ->
   CardCost = window.CardCost
   CardType = window.CardType
   SetViewModel = window.SetViewModel

   ALL_SETS = 'all'

   class CardTypeModel
      constructor: (data) ->
         @id = data.id
         @name = data.name
         @active = ko.observable(true)

   class DialogViewModel
      constructor: (allSets) ->
         # Create new set objects so they can be clicked on 
         @sets = ko.observableArray()
         @selectedSetId = ko.observable(ALL_SETS)
         @types = @createTypes()
         @selectedType = ko.observable(CardType.NONE)
         @costs = @createCosts()
         @vexDialogId = null
         @callback = null

         @openSetsSection = ko.observable(false)
         @openTypesSection = ko.observable(false)
         @openCostsSection = ko.observable(false)

      toggleSetsSection: => @openSetsSection(!@openSetsSection())
      toggleTypesSection: => @openTypesSection(!@openTypesSection())
      toggleCostsSection: => @openCostsSection(!@openCostsSection())

      fetchNewCards: () =>
         @callback()
         @close()

      open: (sets, callback) => 
         @callback = callback
         @sets(@createSets(sets))
         @checkSelectedSetState()
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
      
      resetOptions: ->
         @selectedSetId(ALL_SETS)
         @selectedType(CardType.NONE)
         for cost in @costs
            cost.active(true)

      close: () => 
         return unless @vexDialogId
         vex.close(@vexDialogId)
         @callback = null

      createSets: (sets) ->
         newSets = [new CardTypeModel({ id: ALL_SETS, name: 'Any' })]
         for set in sets
            newSets.push(new CardTypeModel({ id: set.id, name: set.name }))
         return newSets

      checkSelectedSetState: ->
         selectedSetId = @selectedSetId()
         for set in @sets()
            if set.id == selectedSetId
               return
         @selectedSetId(ALL_SETS)

      createTypes: ->
         return [
            new CardTypeModel({ id: CardType.NONE, name: 'Any' })
            new CardTypeModel({ id: CardType.DRAWER, name: '+ Cards' })
            new CardTypeModel({ id: CardType.BUY_SUPPLIER, name: '+1 Buy' })
            new CardTypeModel({ id: CardType.ACTION_SUPPLIER, name: '+2 Actions' })
            new CardTypeModel({ id: CardType.ACTION, name: 'Action' })
            new CardTypeModel({ id: CardType.ATTACK, name: 'Attack' })
            new CardTypeModel({ id: CardType.DURATION, name: 'Duration' })
            new CardTypeModel({ id: CardType.REACTION, name: 'Reaction' })
            new CardTypeModel({ id: CardType.RESERVE, name: 'Reserve' })
            new CardTypeModel({ id: CardType.TRASHING, name: 'Trashing' })
            new CardTypeModel({ id: CardType.TREASURE, name: 'Treasure' })
            new CardTypeModel({ id: CardType.VICTORY, name: 'Victory' })
         ]

      createCosts: ->
         return [
            new CardTypeModel({ id: CardCost.TREASURE_2, name: '1-2' })
            new CardTypeModel({ id: CardCost.TREASURE_3, name: '3' })
            new CardTypeModel({ id: CardCost.TREASURE_4, name: '4' })
            new CardTypeModel({ id: CardCost.TREASURE_5, name: '5' })
            new CardTypeModel({ id: CardCost.TREASURE_6, name: '6' })
            new CardTypeModel({ id: CardCost.TREASURE_7, name: '7' })
            new CardTypeModel({ id: CardCost.TREASURE_8, name: '8+' })
         ]


   window.DialogViewModel = DialogViewModel
   window.DialogViewModel.ALL_SETS = ALL_SETS
