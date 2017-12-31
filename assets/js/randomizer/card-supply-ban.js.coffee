#= require randomizer/supply-ban.js.coffee
#= require utils/card-util.js.coffee

do ->
   CardUtil = window.CardUtil
   SupplyBan = window.SupplyBan

   class CardSupplyBan extends SupplyBan
      constructor: (cardIds) ->
         super()
         @cardIds = cardIds

      getBannedCards: (cards) ->
         return cards.filter(CardUtil.filterByIncludedIds(@cardIds))


   window.CardSupplyBan = CardSupplyBan
