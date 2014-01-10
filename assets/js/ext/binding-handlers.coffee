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

ko.bindingHandlers.scaleOffWidth =
   init: (element, valueAccessor, allBindingsAccessor, viewModel) ->
      heightToWidthRatio = ko.utils.unwrapObservable(valueAccessor())
      $el = $(element)
      $win = $(window)
      setHeight = -> $el.height($el.width() * heightToWidthRatio)
      $win.resize setHeight
      setHeight()

ko.bindingHandlers.slideVisible =
   update: (element, valueAccessor, allBindings) ->
      value = ko.unwrap(valueAccessor())
      duration = allBindings.get('slideDuration') or 400
 
      # Now manipulate the DOM element
      if (value == true) then $(element).slideDown(duration)
      else $(element).slideUp(duration)
