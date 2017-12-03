#= require lib/all.js
#= require utils/querier.js.coffee

do ->
   Querier = window.Querier

   ko.bindingHandlers.dominionSetNames = {
      update: (element, valueAccessor, allBindingsAccessor, viewModel) ->
         setIds = ko.unwrap(valueAccessor())
         elements = []
         for setId in setIds 
            set = Querier.getSetById(setId)
            elements.push('<span class="set-name ' + setId + '">' + set.name + '</span>')
         $(element).html(elements.join(' '))
   }
