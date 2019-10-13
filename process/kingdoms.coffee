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
   "Victory Dance: Baron, Courtier, Duke, Harem, Ironworks, Masquerade, Mill, Nobles, Patrol, Replace,"
   "The Plot Thickens: Conspirator, Ironworks, Lurker, Pawn, Mining Village, Secret Passage, Steward, Swindler, Torturer, Trading Post",
   "Best Wishes: Baron, Conspirator, Courtyard, Diplomat, Duke, Secret Passage, Shanty Town, Torturer, Upgrade, Wishing Well",

   "Underlings: Courtier, Diplomat, Minion, Nobles, Pawn • Cellar, Festival, Library, Sentry, Vassal",
   "Grand Scheme: Bridge, Mill, Mining Village, Patrol, Shanty Town • Artisan, Council Room, Market, Militia, Workshop",
   "Deconstruction: Diplomat, Harem, Lurker, Replace, Swindler • Bandit, Mine, Remodel, Throne Room, Village",

   "A Star to Steer By: Secret Passage, Diplomat, Swindler, Wishing Well, Courtier • Lookout, Treasure Map, Ghost Ship, Haven, Outpost",
   "Shore Patrol: Patrol, Replace, Shanty Town, Trading Post, Pawn • Island, Wharf, Cutpurse, Lighthouse, Warehouse",
   "Bridge Crossing: Lurker, Nobles, Duke, Conspirator, Bridge • Salvager, Embargo, Smugglers, Native Village, Treasury",

   "Servants: Conspirator, Mill, Minion, Pawn, Steward • Golem, Possession, Scrying Pool, Transmute, Vineyard",
   "Secret Research: Bridge, Masquerade, Minion, Nobles, Shanty Town, Torturer • Familiar, Herbalist, Philosopher's Stone, University",
   "Pools, Tools, and Fools: Baron, Ironworks, Lurker, Nobles, Trading Post, Wishing Well • Apothecary, Apprentice, Golem, Scrying Pool",

   "Paths to Victory: Baron, Harem, Pawn, Shanty Town, Upgrade • Bishop, Counting House, Goons, Monument, Peddler",
   "All Along the Watchtower: Bridge, Mill, Mining Village, Pawn, Torturer • Hoard, Talisman, Trade Route, Vault, Watchtower",
   "Lucky Seven: Bridge, Lurker, Patrol, Swindler, Wishing Well • Bank, Expand, Forge, King's Court, Vault",

   "Last Laughs: Minion, Nobles, Pawn, Steward, Swindler • Farming Village, Harvest, Horse Traders, Hunting Party, Jester",
   "The Spice of Life: Courtier, Courtyard, Diplomat, Mining Village, Replace • Fairgrounds, Horn of Plenty, Remake, Tournament, Young Witch", # Bane: Wishing Well
   "Small Victories: Conspirator, Duke, Harem, Pawn, Secret Passage • Fortune Teller, Hamlet, Hunting Party, Remake, Tournament",
   "Name that Card: Courtyard, Harem, Nobles, Replace, Wishing Well • Baker, Doctor, Plaza, Advisor, Masterpiece",
   "Tricks of the Trade: Conspirator, Masquerade, Mill, Nobles, Secret Passage • Stonemason, Herald, Soothsayer, Journeyman, Butcher",
   "Decisions, Decisions: Bridge, Pawn, Mining Village, Upgrade, Duke • Merchant Guild, Candlestick Maker, Masterpiece, Taxman, Butcher",

   "Money for Nothing: Replace, Patrol, Pawn, Shanty Town, Torturer • Cache, Cartographer, Jack of All Trades, Silk Road, Tunnel",
   "The Duke's Ball: Conspirator, Duke, Harem, Masquerade, Upgrade • Duchess, Haggler, Inn, Noble Brigand, Scheme",

   "Prophecy: Baron, Conspirator, Nobles, Secret Passage, Wishing Well • Armory, Ironmonger, Mystic, Rebuild, Vagrant",
   "Invasion: Diplomat, Harem, Swindler, Torturer, Upgrade • Beggar, Marauder, Rogue, Squire, Urchin",

   "Royalty Factory: Pilgrimage • Conspirator, Courtier, Harem, Nobles, Swindler • Bridge Troll, Duplicate, Page, Raze, Royal Carriage",
   "Masters of Finance: Ball, Borrow • Bridge, Pawn, Shanty Town, Steward, Upgrade • Artificer, Distant Lands, Gear, Transmogrify, Wine Merchant",

   "Delicious Torture: Arena, Banquet • Baron, Bridge, Harem, Ironworks, Torturer • Castles, Crown, Enchantress, Sacrifice, SettlersBustling Village",
   "Buddy System: Salt the Earth, Wolf Den • Masquerade, Mining Village, Nobles, Pawn, Trading Post • Archive, Capital, CatapultRocks, Engineer, Forum",
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