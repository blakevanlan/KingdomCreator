rand = require './rand'

PROSPERITY_SET_ID = '52ae7d58f44eea5cd40001fa'
DARK_AGES_SET_ID = '52ae7d7f0b85ba22080001e6'

class Kingdom
   constructor: (cards, filter) ->
      @cards = cards or []
      @filter = filter or {}
      @replaceCards = []
      @keepCards = []
      @types = []
      @requireShelters = false
      @requireColonies = false

   toObject: () =>
      return {
         kingdom: @cards.sort(@cardSorter)
         meta:
            useColonies: @requireColonies or @shouldUseColonies()
            useShelters: @requireShelters or @shouldUseShelters()
      }

   shouldUseColonies: () =>
      return false if @cards.length < 1
      index = rand.getRandomInt(0, @cards.length)
      return @cards[index].set.toString() == PROSPERITY_SET_ID

   shouldUseShelters: () =>
      return false if @cards.length < 1
      index = rand.getRandomInt(0, @cards.length)
      return @cards[index].set.toString() == DARK_AGES_SET_ID

   cardSorter: (a, b) ->
      return -1 if a.set < b.set
      return 1 if a.set > b.set
      return -1 if a.name < b.name
      return 1 if a.name > b.name
      return 0

module.exports = Kingdom