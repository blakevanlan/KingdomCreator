#= require lib/all.js
#= require randomizer/randomizer.js.coffee
#= require viewmodels/set.js.coffee

vex.defaultOptions.className = 'vex-theme-os'

do ->
   Randomizer = window.Randomizer
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

      open: (callback) => 
         @callback = callback
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
      
      close: () => 
         return unless @vexDialogId
         vex.close(@vexDialogId)
         @callback = null

      createTypes: ->
         return [
            new CardType({ id: Randomizer.Type.DRAWER, name: '+ Cards' })
            new CardType({ id: Randomizer.Type.BUY_SUPPLIER, name: '+1 Buy' })
            new CardType({ id: Randomizer.Type.ACTION_SUPPLIER, name: '+2 Actions' })
            new CardType({ id: Randomizer.Type.ACTION, name: 'Action' })
            new CardType({ id: Randomizer.Type.ATTACK, name: 'Attack' })
            new CardType({ id: Randomizer.Type.DURATION, name: 'Duration' })
            new CardType({ id: Randomizer.Type.REACTION, name: 'Reaction' })
            new CardType({ id: Randomizer.Type.RESERVE, name: 'Reserve' })
            new CardType({ id: Randomizer.Type.TRASHING, name: 'Trashing' })
            new CardType({ id: Randomizer.Type.TREASURE, name: 'Treasure' })
            new CardType({ id: Randomizer.Type.VICTORY, name: 'Victory' })
         ]

      createCosts: ->
         return [
            new CardType({ id: Randomizer.Cost.TREASURE_2, name: '1-2' })
            new CardType({ id: Randomizer.Cost.TREASURE_3, name: '3' })
            new CardType({ id: Randomizer.Cost.TREASURE_4, name: '4' })
            new CardType({ id: Randomizer.Cost.TREASURE_5, name: '5' })
            new CardType({ id: Randomizer.Cost.TREASURE_6, name: '6' })
            new CardType({ id: Randomizer.Cost.TREASURE_7, name: '7' })
            new CardType({ id: Randomizer.Cost.TREASURE_8, name: '8+' })
         ]


   window.DialogViewModel = DialogViewModel
