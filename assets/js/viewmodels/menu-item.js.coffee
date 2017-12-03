#= require lib/all.js

do ->
   class MenuItemViewModel
      constructor: (@title, @url, isActive) ->
         @isActive = ko.observable(!!isActive)

      setActive: (isActive) ->
         @isActive(isActive)


   window.MenuItemViewModel = MenuItemViewModel
