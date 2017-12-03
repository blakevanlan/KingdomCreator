#= require lib/all.js

ko.bindingHandlers.showFloating = 
   init: (element, valueAccessor, allBindingsAccessor, viewModel) ->
      trackedSelector = $(ko.utils.unwrapObservable(valueAccessor()))
      $tracked = $(trackedSelector)
      $el = $(element)
      $win = $(window)
      padding = -8
      $win.scroll () ->
         offset = $tracked.offset().top + padding
         if ($win.scrollTop() > offset and viewModel.isCondensed())
            $el.addClass('visible')
            $tracked.addClass('hidden')
         else 
            $el.removeClass('visible')
            $tracked.removeClass('hidden')

ko.bindingHandlers.slideVisible =
   update: (element, valueAccessor, allBindings) ->
      value = ko.unwrap(valueAccessor())
      duration = allBindings.get('slideDuration') or 400
 
      # Now manipulate the DOM element
      if (value == true) then $(element).slideDown(duration)
      else $(element).slideUp(duration)
