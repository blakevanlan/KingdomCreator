rand = require './rand'

class Kingdom
   constructor: (cards, sets, filter) ->
      @cards = cards or []
      @sets = sets or []
      @filter = filter or {}
      @replaceCards = []
      @keepCards = []
      @types = []
      @shouldUseColonies = false
      @shouldUseShelters = false

   toObject: () =>
      console.log("Kingdom", @shouldUseShelters)
      return {
         kingdom: @cards.sort(@cardSorter)
         meta:
            useColonies: @shouldUseColonies
            useShelters: @shouldUseShelters
      }

   cardSorter: (a, b) ->
      return -1 if a.set < b.set
      return 1 if a.set > b.set
      return -1 if a.name < b.name
      return 1 if a.name > b.name
      return 0

module.exports = Kingdom