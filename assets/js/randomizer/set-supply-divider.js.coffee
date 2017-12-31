#= require randomizer/supply-divider.js.coffee
#= require utils/card-util.js.coffee

do ->
   CardUtil = window.CardUtil
   SupplyDivider = window.SupplyDivider

   class SetSupplyDivider extends SupplyDivider
      constructor: (setId, count) ->
         super(count)
         @setId = setId

      getSatisfyingCards: (division) ->
         cards = division.getAvailableCards()
         return cards.filter(CardUtil.filterByIncludedSetIds([@setId]))

      getRemainingCards: (division) ->
         cards = division.getAvailableCards()
         return cards.filter(CardUtil.filterByExcludedSetIds([@setId]))


   window.SetSupplyDivider = SetSupplyDivider
