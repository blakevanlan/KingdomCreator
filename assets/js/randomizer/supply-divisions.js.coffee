#= require utils/card-util.js.coffee

do ->
   CardUtil = window.CardUtil 

   getAvailableCards = (divisions) ->
      cards = []
      for division in divisions
         cards = cards.concat(division.getAvailableCards())
      return cards

   getLockedAndSelectedCards = (divisions) ->
      return getLockedCards(divisions).concat(getSelectedCards(divisions))

   getLockedCards = (divisions) ->
      cards = []
      for division in divisions
         cards = cards.concat(division.getLockedCards())
      return cards

   getSelectedCards = (divisions) ->
      cards = []
      for division in divisions
         cards = cards.concat(division.getSelectedCards())
      return cards

   getAvailableCardsOfType = (divisions, cardType) ->
      cardsPerDivision = getAvailableCardsOfTypePerDivision(divisions, cardType)
      availableCards = []
      for cards in cardsPerDivision
         availableCards = availableCards.concat(cards)
      return availableCards

   getAvailableCardsOfTypePerDivision = (divisions, cardType) ->
      cards = []
      for division, index in divisions
         if division.getSelectedCards().length or !division.isFilled()
            availableCards = division.getAvailableCards()
            cards.push(availableCards.filter(CardUtil.filterByRequiredType(cardType)))
         else
            cards.push([])
      return cards


   window.SupplyDivisions = {
      getLockedAndSelectedCards: getLockedAndSelectedCards
      getLockedCards: getLockedCards
      getSelectedCards: getSelectedCards
      getAvailableCardsOfType: getAvailableCardsOfType
      getAvailableCardsOfTypePerDivision: getAvailableCardsOfTypePerDivision
   }
