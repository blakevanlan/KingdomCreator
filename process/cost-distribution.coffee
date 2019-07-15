Loader = require('./loader')

sets = Loader.loadSets()
kingdoms = Loader.loadKingdoms()

buckets = []

getCardForId = (cardId) ->
   for setId, set of sets
      for card in set.cards
         if card.id == cardId
            return card
   throw Error("Unknown card id: #{cardId}")


for setId, data of kingdoms
   for kingdom in data.kingdoms
      numberOfHighCostCards = 0
      for cardId in kingdom.supply
         card = getCardForId(cardId)
         if card.cost.treasure >= 5
            numberOfHighCostCards += 1
      if !buckets[numberOfHighCostCards]
         buckets[numberOfHighCostCards] = 1
      else 
         buckets[numberOfHighCostCards] += 1
      if numberOfHighCostCards == 7
         console.log(kingdom)

for value, bucketIndex in buckets
   console.log("#{bucketIndex} -> #{value}")

