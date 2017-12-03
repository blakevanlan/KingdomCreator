#= require lib/all.js
#= require utils/querier.js.coffee

do ->
   Querier = window.Querier

   ko.bindingHandlers.withCard = {
      init: (element, valueAccessor, allBindingsAccessor, viewModel, context) ->
         cardFn = Querier.getCardById.bind(null, ko.unwrap(valueAccessor()))
         return ko.bindingHandlers.with.init(element, cardFn, allBindingsAccessor, viewModel, context)

      update: (element, valueAccessor, allBindingsAccessor, viewModel, context) ->
         cardFn = Querier.getCardById.bind(null, ko.unwrap(valueAccessor()))
         return ko.bindingHandlers.with.update(element, cardFn, allBindingsAccessor, viewModel, context)
   }
