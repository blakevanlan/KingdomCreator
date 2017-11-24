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

ko.bindingHandlers.scaleOffWidthOfImage =
   init: (element, valueAccessor, allBindingsAccessor, viewModel) ->
      options = ko.unwrap(valueAccessor())
      selector = ko.unwrap(options.selector)
      $element = $(element)
      $image = $element.find(selector).eq(0)
      image = $image.get(0)
      ko.utils.domData.set(element, 'image', image)
      
      updateFn = updateHeightBasedOnWidth.bind(this, $element, image)
      $(window).resize(updateFn)
      $image.load(updateFn)
      updateFn()

   update: (element, valueAccessor, allBindingsAccessor, viewModel) ->
      options = ko.unwrap(valueAccessor())
      trigger = ko.unwrap(options.trigger)
      $element = $(element)
      image = ko.utils.domData.get(element, 'image')
      # Retry to catch when the dom doesn't update before this is called.
      if !updateHeightBasedOnWidth($element, image)
         setTimeout(updateHeightBasedOnWidth.bind(this, $element, image), 0) 

updateHeightBasedOnWidth = ($element, image) ->
   oldHeight = $element.height()
   ratio = image.naturalHeight / image.naturalWidth
   $element.height($element.width() *  ratio) if ratio
   newHeight = $element.height()
   return oldHeight != newHeight && newHeight != 0


ko.bindingHandlers.slideVisible =
   update: (element, valueAccessor, allBindings) ->
      value = ko.unwrap(valueAccessor())
      duration = allBindings.get('slideDuration') or 400
 
      # Now manipulate the DOM element
      if (value == true) then $(element).slideDown(duration)
      else $(element).slideUp(duration)
