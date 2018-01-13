#= require randomizer/supply-ban.js.coffee
#= require utils/card-util.js.coffee

do ->
   CardUtil = window.CardUtil
   SupplyBan = window.SupplyBan

   class CostSupplyBan extends SupplyBan
      constructor: (costs) ->
         super()
         @costs = costs

      getBannedCards: (cards) ->
         return cards.filter(CardUtil.filterByAllowedCosts(@costs))


   window.CostSupplyBan = CostSupplyBan
