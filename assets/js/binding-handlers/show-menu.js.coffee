#= require lib/all.js
#= require utils/querier.js.coffee

do ->
   ko.bindingHandlers.showMenu = {
      init: (element, valueAccessor, allBindingsAccessor, viewModel) ->
         $(window).resize () ->
            $element = $(element)
            $child = $element.children()
            enabled = ko.utils.domData.set(element, 'showMenu-enabled')
            show = ko.utils.domData.set(element, 'showMenu-show')
            if enabled
               $element.height(if show then $child.outerHeight() else 0)

      update: (element, valueAccessor) ->
         value = ko.unwrap(valueAccessor())
         enabled = ko.unwrap(value.enabled)
         show = ko.unwrap(value.show)
         $element = $(element)
         ko.utils.domData.set(element, 'showMenu-enabled', enabled)
         ko.utils.domData.set(element, 'showMenu-show', show)
         if enabled
            $child = $element.children()
            $element.height(if show then $child.outerHeight() else 0)
         else
            $element.css('height', 'auto')

   }
