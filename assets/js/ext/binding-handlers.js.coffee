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

ko.bindingHandlers.scaleOffWidthOfImage =
   init: (element, valueAccessor, allBindingsAccessor, viewModel) ->
      options = ko.unwrap(valueAccessor())
      selector = ko.unwrap(options.selector)
      $el = $(element)
      $image = $el.find(selector).eq(0)
      image = $image.get(0)
      $win = $(window)
      setHeight = ->
         ratio = image.naturalHeight / image.naturalWidth
         $el.height($el.width() *  ratio) if ratio
      $win.resize(setHeight)
      $image.load(setHeight)
      options.trigger?.subscribe(setHeight)
      setHeight()

ko.bindingHandlers.slideVisible =
   update: (element, valueAccessor, allBindings) ->
      value = ko.unwrap(valueAccessor())
      duration = allBindings.get('slideDuration') or 400
 
      # Now manipulate the DOM element
      if (value == true) then $(element).slideDown(duration)
      else $(element).slideUp(duration)
