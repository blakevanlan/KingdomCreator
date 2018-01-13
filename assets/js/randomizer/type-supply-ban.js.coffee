#= require randomizer/supply-ban.js.coffee
#= require utils/card-util.js.coffee

do ->
   CardUtil = window.CardUtil
   SupplyBan = window.SupplyBan

   class TypeSupplyBan extends SupplyBan
      constructor: (types) ->
         super()
         @types = types

      getBannedCards: (cards) ->
         return cards.filter(CardUtil.filterByAllowedTypes(@types))


   window.TypeSupplyBan = TypeSupplyBan
