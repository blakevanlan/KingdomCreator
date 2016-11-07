#= require lib/all.js

do ->
   ANIMATION_TIME = 600
   IMAGE_PREFEX = '/img/cards'
   VERTICAL_LOADING_IMAGE_URL = "/img/cards/backside_blue.jpg"
   HORIZONTAL_LOADING_IMAGE_URL = "/img/cards/backside_blue_horizontal.jpg"

   class CardViewModel
      constructor: (parent, isVertical) ->
         @parent = parent
         @isVertical = !!isVertical
         @id = ko.observable()
         @setId = ko.observable()
         @name = ko.observable()
         @set = ko.observable()
         @isLoading = ko.observable(true)
         @cardImageLoaded = ko.observable(false)
         @animationStartTime = null
         @selected = ko.observable(false)

         # Build the image URL
         @imageUrl = ko.observable(@getLoadingImageUrl())
         @setClass = ko.computed () =>
            return if @isLoading() then 'loading' else @setId()

      setData: (data, sets) =>
         imageUrl = "#{IMAGE_PREFEX}/#{data.id}.jpg"
         setDataInternal = =>
            @id(data.id)
            @name(data.name)
            @setId(data.setId)
            for set in sets
               if set.id == data.setId
                  @set(set.name)
                  break
            @imageUrl(imageUrl)
            @isLoading(false)
            @setCardLoaded()
         
         @cardImageLoaded(false)
         $.imgpreload imageUrl, =>
            # Delay showing image until transition is complete
            timeRemaining = ANIMATION_TIME - (Date.now() - @animationStartTime)
            if timeRemaining > 0
               setTimeout(setDataInternal, timeRemaining)
            else
               setDataInternal()

      failedToLoad: =>
         @isLoading(false)
         @cardImageLoaded(false)
         if (left = ANIMATION_TIME - (Date.now() - @animationStartTime)) > 0
            setTimeout (=> @cardImageLoaded(true)), left
         else @cardImageLoaded(true)
            
      setToLoading: =>
         @selected(false)
         @isLoading(true)
         @animationStartTime = Date.now()

      setCardLoaded: =>
         @cardImageLoaded(true)
         setTimeout((=> @parent.sortCards()), ANIMATION_TIME)
      
      toggleSelected: () => @selected(!@selected())

      getLoadingImageUrl: =>
         return if @isVertical then VERTICAL_LOADING_IMAGE_URL else HORIZONTAL_LOADING_IMAGE_URL


   window.CardViewModel = CardViewModel
   window.CardViewModel.VERTICAL_LOADING_IMAGE_URL = VERTICAL_LOADING_IMAGE_URL
   window.CardViewModel.HORIZONTAL_LOADING_IMAGE_URL = HORIZONTAL_LOADING_IMAGE_URL
   window.CardViewModel.ANIMATION_TIME = ANIMATION_TIME
