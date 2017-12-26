#= require lib/all.js
#= require binding-handlers/all.js


do ->
   CONDENSED_WIDTH = 800

   initialize = (viewmodel) ->
      $(document).ready ->
         $.cookie.json = true
         ko.applyBindings(viewmodel)
         $(window).resize(updateIsCondensed.bind(null, viewmodel)) 
         updateIsCondensed(viewmodel)

   updateIsCondensed = (viewmodel) ->
      viewmodel.isCondensed($(window).width() <= CONDENSED_WIDTH)


   window.Setup = {
      initialize: initialize
   }