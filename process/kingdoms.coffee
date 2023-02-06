Loader = require('./loader')


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
      if set.ways
         for way in set.ways
            if shortId == way.shortId
               return way
      if set.allies
         for ally in set.allies
            if shortId == ally.shortId
               return ally
      if set.traits
         for trait in set.traits
            if shortId == trait.shortId
               return trait

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
      tokenized = Loader.tokenize(cardName)
      if tokenized
         cards.push(findCardByShortId(tokenized))
   return {
      name: kingdomName
      cards: cards
   }


strings = [
   "Flotsam: Abundance, Crucible, Hasty, First Mate, Fortune Hunter, Jewelled Egg, Landing Party, Mining Road, Secluded Shrine, Silver Mine, Wealthy Village"
   "Jetsam: Prepare • Crew, Cutthroat, Gondola, Pious, Grotto, Longship, Pickaxe, Quartermaster, Search, Siren, Stowaway"

   "Basic Looting: Frigate, Tireless, Harbor Village, Maroon, Pilgrim, Sack of Loot • Cellar, Market, Mine, Moat, Vassal"
   "Voodoo: Maelstrom • Buried Treasure, First Mate, Flagship, Gondola, Shaman • Artisan, Bureaucrat, Cursed, Festival, Moneylender, Remodel "

   "Breaking Eggs: Buried Treasure, Jewelled Egg, Mapmaker, Reckless, Maroon, Quartermaster • Courtier, Harem, Mining Village, Nobles, Replace"
   "Landlubbers: Avoid • Cutthroat, Fortune Hunter, Pendant, Pilgrim, Wealthy Village • Friendly, Conspirator, Mill, Pawn, Secret Passage, Wishing Well"

   "Wine-dark Seas: Cabin Boy, Cage, Enlarge, Cheap, Frigate, Rope • Astrolabe, Caravan, Fishing Village, Sailor, Sea Witch "
   "Treasure Island: Launch • Abundance, Buried Treasure, Crew, Longship, Stowaway • Corsair, Island, Lookout, Sea Chart, Inherited, Treasure Map "

   "Special Delivery: Deliver • Flagship, Jewelled Egg, Mining Road, Swamp Shacks, Tools, Trickster • Alchemist, Apothecary, Cursed, Golem, Transmute "

   "Pretty Trinkets: Figurine, Jewelled Egg, King's Cache, Fated, Rope, Silver Mine • Bank, Crystal Ball, Investment, Tiara, War Chest "
   "Buying Happiness: Looting • Cage, Mining Road, Pendant, Stowaway, Swamp Shacks • Anvil, Bishop, Clerk, Fawning, Magnate, Worker's Village "

   "Of Heralds and Hunters: Cabin Boy, Flagship, Inspiring, Fortune Hunter, Pendant, Pickaxe • Doctor, Fairgrounds, Herald, Soothsayer, Stonemason "
   "Through the Swamp: Journey • Cage, Patient, Pilgrim, Swamp Shacks, Taskmaster, Tools • Baker, Hamlet, Horn of Plenty, Menagerie, Merchant Guild "

   "Desert Dreams: Enlarge, Grotto, Harbor Village, Mapmaker, Pendant • Haggler, Reckless, Nomads, Oasis, Souk, Weaver "
   "Viking Schemes: Scrounge • Cabin Boy, Crew, Crucible, Frigate, Wealthy Village • Rich, Berserker, Cauldron, Fool's Gold, Scheme, Stables "

   "Dad's Rats: First Mate, Maroon, Rope, Search, Shaman • Death Cart, Poor House, Inherited, Rats, Squire, Vagrant "
   "Ravagers: Invasion • Cutthroat, Enlarge, Grotto, King's Cache, Trickster • Counterfeit, Tireless, Forager, Ironmonger, Pillage, Storeroom "

   "Set Sail: Ferry • Figurine, First Mate, Fortune Hunter, Mapmaker, Search • Patient, Artificer, Distant Lands, Port, Ratcatcher, Treasure Trove "
   "Rush Job: Rush • Quartermaster, Secluded Shrine, Stowaway, Swamp Shacks, Tools • Coin of the Realm, Gear, Haunted Woods, Hireling, Shy, Wine Merchant "

   "City Builders: Museum • Abundance, Crucible, Frigate, Taskmaster, Tools • City Quarter, Farmers' Market, Groundskeeper, Nearby, Patrician/Emporium, Wild Hunt "
   "Plenty: Prosper • Friendly, Figurine, Landing Party, Mining Road, Rope, Wealthy Village • Charm, Crown, Enchantress, Gladiator/Fortune, Sacrifice "
   
   "Night of the Loot: Cabin Boy, Figurine, Pendant, Sack of Loot, Pious, Taskmaster • Blessed Village, Crypt, Faithful Hound, Tragic Hero, Werewolf "
   "Skeleton Isle: Foray • Cutthroat, King's Cache, Longship, Pilgrim, Secluded Shrine • Devil's Workshop, Ghost Town, Hasty, Idol, Skulk, Tracker "
   
   "Circle of Life: Cathedral • Frigate, Jewelled Egg, Pickaxe, Search, Shaman • Acting Troupe, Patron, Experiment, Inspiring, Scholar, Swashbuckler "
   "Mirror Masters: Mirror • Crucible, Gondola, Quartermaster, Taskmaster, Trickster • Border Guard, Cargo Ship, Flag Bearer, Seer, Fated, Spices "
   
   "Going Home: Way of the Squirrel • Gondola, Landing Party, Mapmaker, Secluded Shrine, Silver Mine • Barge, Cheap, Gatekeeper, Kiln, Snowy Village, Supplies "
   "Going Big: Peril • Enlarge, Grotto, Harbor Village, Sack of Loot, Siren • Nearby, Animal Fair, Camel Train, Mastermind, Sanctuary, Sheepdog "
   
   "Shipmates: Cave Dwellers • Crew, Flagship, Harbor Village, Sack of Loot, Shaman • Broker, Forts, Innkeeper, Modify, Fawning, Sycophant "
   "Buried and Sunk: Bury • Abundance, Buried Treasure, King's Cache, Landing Party, Maroon • Courier, Highwayman, Shy, Merchant Camp, Odysseys, Skirmisher,"
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