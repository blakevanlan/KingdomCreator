#= require lib/all.js
#= require ext/binding-handlers.js.coffee
#= require viewmodels/main.js.coffee


do ->
   MOBILE_WIDTH = 600
   
   $(document).ready ->
      $.cookie.json = true
      vm = new window.MainViewModel(window.DominionSets)
      ko.applyBindings(vm)
      
      updateIsMobile = ->
         vm.isMobile($(window).width() <= MOBILE_WIDTH)
      $(window).resize(updateIsMobile) 
      updateIsMobile()
