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
      if set.projects
         for project in set.projects
            if shortId == project.shortId
               return project
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
   "Overture: Fair, Acting Troupe, Experiment, Flag Bearer, Hideout, Improve, Inventor, Lackeys, Old Witch, Seer, Treasurer"
   "Prelude: Citadel, Star Chart, Border Guard, Cargo Ship, Ducat, Mountain Village, Priest, Recruiter, Sculptor, Silk Merchant, Swashbuckler, Villain"
   "It Takes a Villager: Road Network, Acting Troupe, Cargo Ship, Recruiter, Seer, Treasurer, Market, Merchant, Mine, Smithy, Vassal"
   "Capture the Flag: Barracks, Pageant, Flag Bearer, Lackeys, Scholar, Swashbuckler, Villain, Cellar, Festival, Harbinger, Remodel, Workshop"
   "Memento Mori: Citadel, Experiment, Flag Bearer, Patron, Recruiter, Silk Merchant, Ironworks, Lurker, Patrol, Swindler, Upgrade"
   "Clockwork Court: Fleet, Sinister Plot, Acting Troupe, Inventor, Research, Scepter, Scholar, Courtier, Mining Village, Nobles, Replace, Steward"
   "Free Shipping: Innovation, Acting Troupe, Cargo Ship, Lackeys, Research, Spices, Embargo, Island, Outpost, Smugglers, Wharf"
   "Digging for Treasure: Crop Rotation, Silos, Border Guard, Flag Bearer, Inventor, Sculptor, Swashbuckler, Caravan, Native Village, Salvager, Tactician, Treasure Map"
   "Peek-a-boo: Cathedral, Cargo Ship, Improve, Lackeys, Patron, Sculptor, Silk Merchant, Alchemist, Apothecary, Golem, Scrying Pool"
   "Dreamers of Dreams: Academy, Cargo Ship, Old Witch, Priest, Scepter, Scholar, Expand, Monument, Vault, Watchtower, Worker's Village"
   "Movers and Shakers: Capitalism, Citadel, Hideout, Patron, Research, Treasurer, Villain, Bank, City, Grand Market, Loan, Rabble"
   "Sweetened Deals: Silos, Flag Bearer, Lackeys, Mountain Village, Silk Merchant, Spices, Cartographer, Develop, Farmland, Haggler, Spice Merchant"
   "A Penny Saved: Barracks, Guildhall, Ducat, Patron, Scepter, Seer, Swashbuckler, Cache, Crossroads, Noble Brigand, Oasis, Trader"
   "Stargazing: Star Chart, Border Guard, Patron, Seer, Silk Merchant, Swashbuckler, Hermit, Mystic, Procession, Sage, Wandering Minstrel"
   "Sewer Rats: Crop Rotation, Sewers, Flag Bearer, Improve, Lackeys, Mountain Village, Research, Count, Counterfeit, Cultist, Graverobber, Rats"
   "Combo Corner: Canal, Ducat, Experiment, Hideout, Sculptor, Seer, Herald, Horn of Plenty, Horse Traders, Jester, Stonemason"
   "Filling the Coffers: City Gate, Star Chart, Priest, Recruiter, Spices, Swashbuckler, Treasurer, Baker, Butcher, Menagerie, Merchant Guild, Plaza"
   "Progress: Piazza, Training, Experiment, Improve, Recruiter, Seer, Silk Merchant, Hireling, Ranger, Raze, Swamp Hag, Transmogrify"
   "Once Upon a Time: Innovation, Ferry, Acting Troupe, Lackeys, Priest, Sculptor, Spices, Distant Lands, Duplicate, Haunted Woods, Royal Carriage, Storyteller"
   "Exploring the City: Exploration, Battlefield, Cargo Ship, Experiment, Mountain Village, Priest, Sculptor, City Quarter, Farmers' Market, Groundskeeper, Sacrifice, Wild Hunt"
   "Navigating the Sewers: Sewers, Ritual, Acting Troupe, Flag Bearer, Improve, Old Witch, Scepter, Chariot Race, Enchantress, GladiatorFortune, PatricianEmporium, Villa"
   "Becoming a Monster: Exploration, Experiment, Mountain Village, Old Witch, Research, Spices, Devil's Workshop, Monastery, Shepherd, Skulk, Tragic Hero"
   "True Believers: Cathedral, Piazza, Border Guard, Cargo Ship, Scholar, Sculptor, Villain, Blessed Village, Crypt, Faithful Hound, Sacred Grove, Secret Cave"
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