#= require lib/all.js
#= require utils/querier.js.coffee

do ->
   IMAGE_PREFEX = '/img/cards'

   ko.bindingHandlers.cardImage = {
      update: (element, valueAccessor, allBindingsAccessor, viewModel) ->
         cardOrId = valueAccessor()
         cardId = if typeof cardOrId == 'string' then cardOrId else cardOrId.id
         element.src = "#{IMAGE_PREFEX}/#{cardId}.jpg"
   }
