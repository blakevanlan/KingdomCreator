#= require lib/all.js

do ->
   ko.bindingHandlers.fadeIn = {
      init: (element, valueAccessor, allBindingsAccessor, viewModel) ->
         $el = $(element)
         value = ko.unwrap(valueAccessor())
         fadeIn($el, value)
   
      update: (element, valueAccessor, allBindingsAccessor, viewModel) ->
         $el = $(element)
         value = ko.unwrap(valueAccessor())
         isVisible = Number($el.css("opacity")) == 1
         if !!value == isVisible
            # Already in the proper state.
            return

         fadeIn($el, value)
   }

   fadeIn = ($el, visible) ->
      if visible
         $el.show()
         setTimeout((() -> $el.css("opacity", 1)), 0)
      else
         $el.hide()
         $el.css("opacity", 0)