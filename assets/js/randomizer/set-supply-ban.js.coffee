#= require randomizer/supply-ban.js.coffee
#= require utils/card-util.js.coffee

do ->
   CardUtil = window.CardUtil
   SupplyBan = window.SupplyBan

   class SetSupplyBan extends SupplyBan
      constructor: (setIds) ->
         super()
         @setIds = setIds

      getBannedCards: (cards) ->
         return cards.filter(CardUtil.filterByIncludedSetIds(@setIds))


   window.SetSupplyBan = SetSupplyBan
