Loader = require('../utils/loader')


sets = Loader.loadSets()

findCardByShortId = (shortId) ->
   for setId, set of sets
      for card in set.cards
         if shortId == card.shortId
            return card
      if set.events
         for event in set.events
            if shortId == event.shortId
               return event
      if set.landmarks
         for landmark in set.landmarks
            if shortId == landmark.shortId
               return landmark
      if set.boons
         for boon in set.boons
            if shortId == boon.shortId
               return boon
            
   throw Error('Card not found: ' + shortId)

getSetsForCards = (cards) ->
   setIdsMap = {}
   for card in cards
      setIdsMap[card.setId] = true
   setIds = (set for set of setIdsMap)
   setIds.sort()
   return setIds

parseSupplyString = (supplyString) ->
   split = supplyString.split(":")
   kingdomName = split[0].trim()
   cardNames =
      split[1]
         .replace(/\//g, ',')
         .replace(/\(/g, ',')
         .replace(/\)/g, '')
         .replace(/•/g, ',')
         .split(',')
   cards = []
   for cardName in cardNames 
      cards.push(findCardByShortId(Loader.tokenize(cardName)))
   return {
      name: kingdomName
      cards: cards
   }


strings = [
   "Beginners: Bank, Counting House, Expand, Goons, Monument, Rabble, Royal Seal, Venture, Watchtower, Worker's Village"
   "Friendly Interactive: Bishop, City, Contraband, Forge, Hoard, Peddler, Royal Seal, Trade Route, Vault, Worker's Village"
   "Big Actions: City, Expand, Grand Market, King's Court, Loan, Mint, Quarry, Rabble, Talisman, Vault"
   "Biggest Money: Bank, Grand Market, Mint, Royal Seal, Venture, Adventurer, Laboratory, Mine, Moneylender, Spy"
   "The King's Army: Expand, Goons, King's Court, Rabble, Vault, Bureaucrat, Council Room, Moat, Spy, Village"
   "The Good Life: Contraband, Counting House, Hoard, Monument, Mountebank, Bureaucrat, Cellar, Chancellor, Gardens, Village"
   "Paths to Victory: Bishop, Counting House, Goons, Monument, Peddler, Baron, Harem, Pawn, Shanty Town, Upgrade"
   "All Along the Watchtower: Hoard, Talisman, Trade Route, Vault, Watchtower, Bridge, Great Hall, Mining Village, Pawn, Torturer"
   "Lucky Seven: Bank, Expand, Forge, King's Court, Vault, Bridge, Coppersmith, Swindler, Tribute, Wishing Well"
]

for string in strings
   kingdom = parseSupplyString(string)
   
   console.log("  - name: " + kingdom.name)
   
   setIds = getSetsForCards(kingdom.cards)
   console.log('    sets:')
   for setId in setIds
      console.log('      - ' + setId)

   console.log('    supply:')
   cardIds = (card.id for card in kingdom.cards)
   cardIds.sort()
   for cardId in cardIds
      console.log('      - ' + cardId)

   console.log("")