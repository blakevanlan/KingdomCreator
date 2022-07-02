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

sortBy = (key, a, b, r) ->
    r = if r then 1 else -1
    return -1*r if a[key] > b[key]
    return +1*r if a[key] < b[key]
    return 0


strings = ["Decisions, Decisions: City-state, Bauble, Courier, Highwayman, Hunter, Innkeeper, Marquis, Merchant Camp, Modify, Royal Galley, Townsfolk"
"Foresight: Order of Astrologers, Augurs, Barbarian, Carpenter, Emissary, Galleria, Sentinel, Skirmisher, Specialist, Town, Underling"
"Allies for Beginners: Crafters' Guild, Broker, Capital City, Galleria, Odysseys, Sycophant, Gardens, Harbinger, Market, Remodel, Vassal"
"Warring Shopkeepers: League of Shopkeepers, Clashes, Emissary, Guildmaster, Royal Galley, Town, Bandit, Laboratory, Merchant, Moat, Moneylender"
"Dark Dealings: Circle of Witches, Broker, Contract, Courier, Hunter, Townsfolk, Courtier, Lurker, Nobles, Secret Passage, Steward"
"Pawns and Underlings: Plateau Shepherds, Innkeeper, Merchant Camp, Swap, Underling, Wizards, Baron, Conspirator, Patrol, Pawn, Replace"
"Forward Thinking: Cave Dwellers, Guildmaster, Highwayman, Odysseys, Royal Galley, Sentinel, Cutpurse, Native Village, Smugglers, Tactician, Warehouse"
"Treasure Hunt: Market Towns, Emissary, Forts, Marquis, Swap, Town, Haven, Lookout, Outpost, Treasure Map, Treasury"
"Recursion: Coastal Haven, Barbarian, Galleria, Importer, Merchant Camp, Modify, Wizards, Alchemist, Apprentice, Golem, Scrying Pool"
"Inventing Mania: Family of Inventors, Augurs, Bauble, Capital City, Carpenter, Importer, Expand, King's Court, Quarry, Rabble, Talisman"
"Bank of Toadies: League of Bankers, Broker, Marquis, Odysseys, Sycophant, Town, Bank, City, Mint, Trade Route, Vault"
"Huge Collections: Woodworkers' Guild, Clashes, Contract, Forts, Galleria, Sentinel, Advisor, Fairgrounds, Hunting Party, Menagerie, Plaza"
"Forest Scouts: Forest Dwellers, Augurs, Emissary, Innkeeper, Royal Galley, Sentinel, Baker, Candlestick Maker, Farming Village, Jester, Journeyman"
"Longest Tunnel: Fellowship of Scribes, Bauble, Capital City, Carpenter, Contract, Innkeeper, Farmland, Haggler, Jack of All Trades, Margrave, Tunnel"
"Expertise: Order of Masons, Barbarian, Highwayman, Specialist, Townsfolk, Underling, Border Village, Crossroads, Highway, Inn, Spice Merchant"
"Grave Matters: Cave Dwellers, Barbarian, Broker, Contract, Highwayman, Wizards, Bandit Camp, Beggar, Forager, Graverobber, Poor House"
"Rat Traders: Desert Guides, Emissary, Importer, Skirmisher, Swap, Townsfolk, Count, Death Cart, Knights, Rats, Squire"
"Adventures in Pickpocketing: Gang of Pickpockets, Mission, Augurs, Bauble, Innkeeper, Modify, Specialist, Artificer, Duplicate, Lost City, Miser, Treasure Trove"
"Future Perfect: Market Towns, Seaway, Forts, Marquis, Sentinel, Skirmisher, Sycophant, Caravan Guard, Gear, Haunted Woods, Port, Transmogrify"
"Island Empire: Island Folk, Orchard, Contract, Forts, Specialist, Swap, Sycophant, City Quarter, Enchantress, Farmers' Market, Settlers Bustling Village, Wild Hunt"
"Castle Wars: Trappers' Lodge, Triumph, Capital City, Carpenter, Clashes, Hunter, Importer, Castles, Catapult Rocks, Charm, Crown, Patrician Emporium"
"Love and Death: Peaceful Cult, Augurs, Bauble, Carpenter, Hunter, Sycophant, Conclave, Den of Sin, Faithful Hound, Idol, Necromancer"
"Play It Again, Sam: Woodworkers' Guild, Wizards, Swap, Royal Galley, Courier, Hunter, Blessed Village, Leprechaun, Skulk, Tormentor, Tracker"
"Production Line: Band of Nomads, Exploration, Courier, Importer, Modify, Townsfolk, Wizards, Experiment, Mountain Village, Patron, Spices, Treasurer"
"Age of Scribes: Fellowship of Scribes, Sinister Plot, Capital City, Galleria, Odysseys, Specialist, Underling, Acting Troupe, Inventor, Old Witch, Research, Villain"
"Wise Owls: Architects' Guild, Way of the Owl, Barbarian, Marquis, Merchant Camp, Town, Wizards, Animal Fair, Black Cat, Bounty Hunter, Hostelry, Hunting Lodge"
"Mountain Kings: Mountain Folk, Toil, Broker, Courier, Forts, Guildmaster, Skirmisher, Barge, Coven, Scrap, Snowy Village, Supplies"
]

console.log("kingdoms:")
for string in strings
   kingdom = parseSupplyString(string)
   
   console.log("  - name: " + kingdom.name)
   
   setIds = getSetsForCards(kingdom.cards)
   console.log('    sets:')
   for setId in setIds
      console.log('      - ' + setId)

   kingdomCards = (kingdom.cards).sort (a,b) ->
      sortBy('id', a, b,true)

   kingdomCards = (kingdom.cards).sort (a,b) ->
      sortBy('cardType', a, b,false)

   #console.log(kingdom.cards)

   console.log('    supply:')
   for card in kingdomCards
      if (card.cardType != index )
         index = card.cardType
         switch (index)
            when "1 // events"    then console.log('    events:')
            when "2 // landmarks" then console.log('    landmarks:')
            when "3 // projects"  then  console.log('    projects:')
            when "4 // boons"     then console.log('    boons:')
            when "5 // ways"      then console.log('    ways:')
            when "6 // allies"    then console.log('    allies:')
      console.log('      - ' + card.id)

   console.log("")