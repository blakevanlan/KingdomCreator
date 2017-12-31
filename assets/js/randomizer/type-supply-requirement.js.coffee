#= require randomizer/supply-requirement.js.coffee
#= require utils/card-util.js.coffee

do ->
   CardUtil = window.CardUtil
   SupplyRequirement = window.SupplyRequirement

   class TypeSupplyRequirement extends SupplyRequirement
      constructor: (type, requireNewCard) ->
         super()
         @type = type
         @requireNewCard = requireNewCard

      isSatisfied: (divisions) ->
         if @requireNewCard
            return false
         return super(divisions)

      getSatisfyingCards: (cards) ->
         return cards.filter(CardUtil.filterByRequiredType(@type))


   window.TypeSupplyRequirement = TypeSupplyRequirement
