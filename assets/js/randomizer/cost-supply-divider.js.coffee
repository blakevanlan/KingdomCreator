#= require randomizer/supply-divider.js.coffee
#= require utils/card-util.js.coffee
#= require models/card-cost.js.coffee

do ->
   CardCostValues = window.CardCostValues
   CardUtil = window.CardUtil
   SupplyDivider = window.SupplyDivider

   DEBT_COST_VALUE = 1
   POTION_COST_VALUE = 2
   TREASURE_COST_VALUE = 1

   class CostSupplyDivider extends SupplyDivider
      constructor: (highCostCutOff, numberOfHighCostCards) ->
         super(numberOfHighCostCards)
         @highCostCutOff = highCostCutOff

      getSatisfyingCards: (division) ->
         return division.getAvailableCards().filter(@isSatisfyingCard)

      getRemainingCards: (division) ->
         return division.getAvailableCards().filter(@isRemainingCard)

      isSatisfyingCard: (card) =>
         costValue = @getCardCost(card)
         return costValue >= @highCostCutOff

      isRemainingCard: (card) =>
         costValue = @getCardCost(card)
         return costValue < @highCostCutOff

      getCardCost: (card) =>
         debtValue = (card.cost.debt or 0) * DEBT_COST_VALUE
         potionValue = (card.cost.potion or 0) * POTION_COST_VALUE
         treasureValue = (card.cost.treasure or 0) * TREASURE_COST_VALUE
         return debtValue + potionValue + treasureValue


   window.CostSupplyDivider = CostSupplyDivider
