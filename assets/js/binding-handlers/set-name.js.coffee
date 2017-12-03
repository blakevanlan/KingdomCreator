#= require lib/all.js
#= require utils/querier.js.coffee

do ->
   Querier = window.Querier

   ko.bindingHandlers.dominionSetName = {
      update: (element, valueAccessor, allBindingsAccessor, viewModel) ->
         value = valueAccessor()
         setId = Querier.getSetIdFromObject(value)
         set = Querier.getSetById(setId)
         $(element).html('<span class="set-name ' + setId + '">' + set.name + '</span>')
   }
