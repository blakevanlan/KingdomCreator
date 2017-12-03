#= require lib/all.js

do ->

   ko.bindingHandlers.scaleOffWidthOfImage = {
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
   }

   updateHeightBasedOnWidth = ($element, image) ->
      oldHeight = $element.height()
      ratio = image.naturalHeight / image.naturalWidth
      $element.height($element.width() *  ratio) if ratio
      newHeight = $element.height()
      return oldHeight != newHeight && newHeight != 0
