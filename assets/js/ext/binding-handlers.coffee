ko.bindingHandlers.showFloating = 
   init: (element, valueAccessor, allBindingsAccessor, viewModel) ->
      $tracked = $(ko.utils.unwrapObservable valueAccessor())
      offset = $tracked.height() + $tracked.offset().top
      $el = $(element)
      $win = $(window)
      $win.scroll () ->
         if ($win.scrollTop() > offset and viewModel.isMobile())
            $el.show()
         else $el.hide()
