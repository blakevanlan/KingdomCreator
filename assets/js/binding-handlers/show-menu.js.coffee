#= require lib/all.js
#= require utils/querier.js.coffee

do ->
   ko.bindingHandlers.showMenu = {
      init: (element, valueAccessor, allBindingsAccessor, viewModel) ->
         $(window).resize () ->
            $element = $(element)
            $child = $element.children()
            $element.height(if $element.height() > 0 then $child.outerHeight() else 0)

      update: (element, valueAccessor) ->
         value = ko.unwrap(valueAccessor())
         $element = $(element)
         $child = $element.children()
         $element.height(if value then $child.outerHeight() else 0)
   }
