#= require lib/all.js
#= require viewmodels/menu-item.js.coffee

do ->
   MenuItemViewModel = window.MenuItemViewModel

   MenuItem = {
      NONE: -1
      RANDOMIZER: 0
      SETS: 1
   }

   class PageViewModel
      constructor: (subtitle, selectedMenuItemIndex) ->
         @subtitle = ko.observable(subtitle)
         @showMenu = ko.observable(false)
         @menuItems = @createMenuItemsWithSelectedIndex(selectedMenuItemIndex)
         @isCondensed = ko.observable(false)

      toggleMenu: =>
         # Scroll to the top of the window before showing the menu to make sure the menu comes into
         # view.
         debugger
         showMenu = !@showMenu()
         $(window).scrollTop(0) if showMenu
         @showMenu(showMenu)

      createMenuItemsWithSelectedIndex: (selectedMenuItemIndex) ->
         return [
            new MenuItemViewModel(
               'Randomizer', '/index.html', selectedMenuItemIndex == MenuItem.RANDOMIZER)
            new MenuItemViewModel(
               'Recommended Kingdoms', '/sets.html', selectedMenuItemIndex == MenuItem.SETS)
         ] 


   PageViewModel.MenuItem = MenuItem
   window.PageViewModel = PageViewModel
