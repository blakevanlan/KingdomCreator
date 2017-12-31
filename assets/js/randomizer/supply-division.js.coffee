#= require utils/card-util.js.coffee
#= require utils/rand-util.js.coffee

do ->
   CardUtil = window.CardUtil
   RandUtil = window.RandUtil

   class SupplyDivision
      constructor: (availableCards, lockedCards, selectedCards, totalCount) ->
         if lockedCards.length + selectedCards.length > totalCount
            throw Error('Cannot create a division with more locked and selected cards than the total count.')
         if availableCards.length == 0 and lockedCards.length + selectedCards.length < totalCount
            throw Error('Cannot create an unfilled division without available cards.')
         @availableCards = availableCards
         @lockedCards = lockedCards
         @selectedCards = selectedCards
         @totalCount = totalCount

      getAvailableCards: ->
         return @availableCards

      getLockedCards: ->
         return @lockedCards

      getSelectedCards: ->
         return @selectedCards 

      getLockedAndSelectedCards: ->
         return @lockedCards.concat(@selectedCards)

      getTotalCount: ->
         return @totalCount

      getUnfilledCount: ->
         return @totalCount - @lockedCards.length - @selectedCards.length

      isFilled: ->
         return @lockedCards.length + @selectedCards.length >= @totalCount

      createDivisionByRemovingCards: (cardIds) ->
         availableCards = @availableCards.filter(CardUtil.filterByExcludedIds(cardIds))
         selectedCards = @selectedCards.filter(CardUtil.filterByExcludedIds(cardIds))
         return new SupplyDivision(availableCards, @lockedCards, selectedCards, @totalCount)

      createDivisionByLockingCard: (cardId) ->
         lockedCard = CardUtil.findCardById(@availableCards, cardId)
         if lockedCard
            cards = @availableCards.filter(CardUtil.filterByExcludedIds([cardId]))
            return new SupplyDivision(
                  cards, @lockedCards.concat(lockedCard), @selectedCards, @totalCount)

         lockedCard = CardUtil.findCardById(@selectedCards, cardId)
         if lockedCard
            cards = @selectedCards.filter(CardUtil.filterByExcludedIds([cardId]))
            return new SupplyDivision(
                  @availableCards, @lockedCards.concat(lockedCard), cards, @totalCount)

         throw Error("Can't lock card: #{cardId}. Not found in available or selected cards.")

      createDivisionBySelectingCard: (cardId) ->
         selectedCard = CardUtil.findCardById(@availableCards, cardId)
         if !selectedCard
            throw Error("Can't select card: #{cardId}. Not found in available cards.")
         cards = @availableCards.filter(CardUtil.filterByExcludedIds([cardId]))
         return new SupplyDivision(
               cards, @lockedCards, @selectedCards.concat(selectedCard), @totalCount)


   window.SupplyDivision = SupplyDivision
