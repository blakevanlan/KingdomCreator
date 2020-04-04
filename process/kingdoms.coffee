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
   "Intro to Horses: Way of the Sheep, Enhance, Animal Fair, Barge, Destrier, Goatherd, Hostelry, Livery, Paddock, Scrap, Sheepdog, Supplies"
   "Intro to Exile: Way of the Worm, March, Black Cat, Bounty Hunter, Camel Train, Cardinal, Falconer, Mastermind, Sanctuary, Snowy Village, Stockpile, Wayfarer"

   "Pony Express: Way of the Seal, Stampede, Barge, Destrier, Paddock, Stockpile, Supplies, Artisan, Cellar, Market, Mine, Village"
   "Garden of Cats: Way of the Mole, Toil, Black Cat, Displace, Sanctuary, Scrap, Snowy Village, Bandit, Gardens, Harbinger, Merchant, Moat"

   "Dog & Pony Show: Way of the Horse, Commerce, Camel Train, Cavalry, Goatherd, Paddock, Sheepdog, Mill, Nobles, Pawn, Torturer, Upgrade"
   "Explosions: Way of the Squirrel, Populate, Animal Fair, Bounty Hunter, Coven, Hunting Lodge, Scrap, Courtyard, Diplomat, Lurker, Replace, Wishing Well"

   "Innsmouth: Way of the Goat, Invest, Animal Fair, Barge, Coven, Fisherman, Sheepdog, Caravan, Explorer, Fishing Village, Haven, Treasure Map"
   "Ruritania: Way of the Monkey, Alliance, Bounty Hunter, Cavalry, Falconer, Sleigh, Village Green, Lookout, Smugglers, Outpost, Tactician, Warehouse"

   "Class of '20: Way of the Owl, Delay, Cavalry, Coven, Hunting Lodge, Kiln, Livery, Snowy Village, Wayfarer, Transmute, Vineyard, University"

   "Limited Time Offer: Way of the Frog, Desperation, Destrier, Displace, Fisherman, Supplies, Wayfarer, Grand Market, Mint, Peddler, Talisman, Worker's Village"
   "Birth of a Nation: Way of the Otter, Reap, Animal Fair, Camel Train, Mastermind, Paddock, Stockpile, City, Monument, Quarry, Rabble, Trade Route"

   "Living in Exile: Way of the Mule, Enclave, Gatekeeper, Hostelry, Livery, Scrap, Stockpile, Fairgrounds, Hamlet, Jester, Journeyman, Taxman"
   "Thrill of the Hunt: Way of the Rat, Pursue, Black Cat, Bounty Hunter, Camel Train, Mastermind, Village Green, Butcher, Horse Traders, Hunting Party, Menagerie, Tournament"

   "Big Blue: Way of the Turtle, Banish, Black Cat, Falconer, Sheepdog, Sleigh, Village Green, Cartographer, Fool's Gold, Margrave, Trader, Tunnel"
   "Intersection: Way of the Mouse, Crossroads, Gamble, Cardinal, Hostelry, Livery, Mastermind, Supplies, Develop, Farmland, Haggler, Nomad Camp, Stables"

   "Friendly Carnage: Way of the Camel, Ride, Animal Fair, Cardinal, Falconer, Goatherd, Hunting Lodge, Altar, Beggar, Catacombs, Fortress, Market Square•"
   "Gift Horses: Way of the Butterfly, Bargain, Camel Train, Destrier, Displace, Paddock, Scrap, Hunting Grounds, Pillage, Rats, Sage, Squire"

   "Horse Feathers: Way of the Ox, Pilgrimage, Destrier, Displace, Falconer, Sleigh, Stockpile, Magpie, Ranger, Ratcatcher, Relic, Royal Carriage"
   "Sooner or Later: Toil, Mission, Barge, Gatekeeper, Groom, Mastermind, Village Green, Amulet, Caravan Guard, Dungeon, Giant, Raze"

   "No Money Down: Way of the Pig, Advance, Animal Fair, Cavalry, Sleigh, Stockpile, Wayfarer, CatapultRocks, City Quarter, Crown, Engineer, Villa"
   "Detours and Shortcuts: Transport, Triumphal Arch, Camel Train, Fisherman, Gatekeeper, Sanctuary, Snowy Village, Enchantress, Overlord, Sacrifice, SettlersBustling Village, Wild Hunt"

   "Seize the Night: Way of the Sheep, Seize the Day, Barge, Falconer, Hostelry, Sheepdog, Supplies, Cobbler, Devil's Workshop, Exorcist, Monastery, Skulk"
   "Animal Crackers: Way of the Chameleon, Enhance, Black Cat, Goatherd, Groom, Hunting Lodge, Kiln, Faithful Hound, Pixie, Pooka, Sacred Grove, Shepherd"

   "Biding Time: Way of the Turtle, Sinister Plot, Cavalry, Coven, Displace, Fisherman, Goatherd, Ducat, Priest, Recruiter, Scepter, Swashbuckler"
   "Villager Madness: Demand, Academy, Cardinal, Groom, Kiln, Livery, Wayfarer, Border Guard, Flag Bearer, Patron, Silk Merchant, Spices"
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