#= require lib/all.js
#= require ext/binding-handlers.js.coffee
#= require viewmodels/main.js.coffee


do ->
   CONDENSED_WIDTH = 750
   
   $(document).ready ->
      $.cookie.json = true
      vm = new window.MainViewModel(window.DominionSets)
      ko.applyBindings(vm)
      
      updateIsCondensed = ->
         vm.isCondensed($(window).width() <= CONDENSED_WIDTH)
      $(window).resize(updateIsCondensed) 
      updateIsCondensed()
