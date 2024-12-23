import { loadSets, tokenize }  from './loader.js'; // read <set>.yaml
import fs from 'fs';
const sets = loadSets();
const PROCESSED = "processed"
let PROCESSING_DIR = `./${PROCESSED}/kingdoms`

const Kingdoms = [];
Kingdoms["plunder"] = [
  "Flotsam: Abundance, Crucible, Hasty , First Mate, Fortune Hunter, Jewelled Egg, Landing Party, Mining Road, Secluded Shrine, Silver Mine, Wealthy Village",
  "Jetsam: Prepare • Crew, Cutthroat, Gondola, Pious, Grotto, Longship, Pickaxe, Quartermaster, Search, Siren, Stowaway",

  "Basic Looting: Frigate, Tireless, Harbor Village, Maroon, Pilgrim, Sack of Loot • Cellar, Market, Mine, Moat, Vassal",
  "Voodoo: Maelstrom • Buried Treasure, First Mate, Flagship, Gondola, Shaman • Artisan, Bureaucrat, Cursed, Festival, Moneylender, Remodel ",

  "Breaking Eggs: Buried Treasure, Jewelled Egg, Mapmaker, Reckless, Maroon, Quartermaster • Courtier, Harem, Mining Village, Nobles, Replace",
  "Landlubbers: Avoid • Cutthroat, Fortune Hunter, Pendant, Pilgrim, Wealthy Village • Friendly, Conspirator, Mill, Pawn, Secret Passage, Wishing Well",

  "Wine-dark Seas: Cabin Boy, Cage, Enlarge, Cheap, Frigate, Rope • Astrolabe, Caravan, Fishing Village, Sailor, Sea Witch ",
  "Treasure Island: Launch • Abundance, Buried Treasure, Crew, Longship, Stowaway • Corsair, Island, Lookout, Sea Chart, Inherited, Treasure Map ",

  "Special Delivery: Deliver • Flagship, Jewelled Egg, Mining Road, Swamp Shacks, Tools, Trickster • Alchemist, Apothecary, Cursed, Golem, Transmute ",

  "Pretty Trinkets: Figurine, Jewelled Egg, King's Cache, Fated, Rope, Silver Mine • Bank, Crystal Ball, Investment, Tiara, War Chest ",
  "Buying Happiness: Looting • Cage, Mining Road, Pendant, Stowaway, Swamp Shacks • Anvil, Bishop, Clerk, Fawning, Magnate, Worker's Village ",

  "Of Heralds and Hunters: Cabin Boy, Flagship, Inspiring, Fortune Hunter, Pendant, Pickaxe • Doctor, Fairgrounds, Herald, Soothsayer, Stonemason ",
  "Through the Swamp: Journey • Cage, Patient, Pilgrim, Swamp Shacks, Taskmaster, Tools • Baker, Hamlet, Horn of Plenty, Menagerie, Merchant Guild ",

  "Desert Dreams: Enlarge, Grotto, Harbor Village, Mapmaker, Pendant • Haggler, Reckless, Nomads, Oasis, Souk, Weaver ",
  "Viking Schemes: Scrounge • Cabin Boy, Crew, Crucible, Frigate, Wealthy Village • Rich, Berserker, Cauldron, Fool's Gold, Scheme, Stables ",

  "Dad's Rats: First Mate, Maroon, Rope, Search, Shaman • Death Cart, Poor House, Inherited, Rats, Squire, Vagrant ",
  "Ravagers: Invasion • Cutthroat, Enlarge, Grotto, King's Cache, Trickster • Counterfeit, Tireless, Forager, Ironmonger, Pillage, Storeroom ",

  "Set Sail: Ferry • Figurine, First Mate, Fortune Hunter, Mapmaker, Search • Patient, Artificer, Distant Lands, Port, Ratcatcher, Treasure Trove ",
  "Rush Job: Rush • Quartermaster, Secluded Shrine, Stowaway, Swamp Shacks, Tools • Coin of the Realm, Gear, Haunted Woods, Hireling, Shy, Wine Merchant ",

  "City Builders: Museum • Abundance, Crucible, Frigate, Taskmaster, Tools • City Quarter, Farmers' Market, Groundskeeper, Nearby, Patrician/Emporium, Wild Hunt ",
  "Plenty: Prosper • Friendly, Figurine, Landing Party, Mining Road, Rope, Wealthy Village • Charm, Crown, Enchantress, Gladiator/Fortune, Sacrifice ",

  "Night of the Loot: Cabin Boy, Figurine, Pendant, Sack of Loot, Pious, Taskmaster • Blessed Village, Crypt, Faithful Hound, Tragic Hero, Werewolf ",
  "Skeleton Isle: Foray • Cutthroat, King's Cache, Longship, Pilgrim, Secluded Shrine • Devil's Workshop, Ghost Town, Hasty, Idol, Skulk, Tracker ",

  "Circle of Life: Cathedral • Frigate, Jewelled Egg, Pickaxe, Search, Shaman • Acting Troupe, Patron, Experiment, Inspiring, Scholar, Swashbuckler ",
  "Mirror Masters: Mirror • Crucible, Gondola, Quartermaster, Taskmaster, Trickster • Border Guard, Cargo Ship, Flag Bearer, Seer, Fated, Spices ",

  "Going Home: Way of the Squirrel • Gondola, Landing Party, Mapmaker, Secluded Shrine, Silver Mine • Barge, Cheap, Gatekeeper, Kiln, Snowy Village, Supplies ",
  "Going Big: Peril • Enlarge, Grotto, Harbor Village, Sack of Loot, Siren • Nearby, Animal Fair, Camel Train, Mastermind, Sanctuary, Sheepdog ",

  "Shipmates: Cave Dwellers • Crew, Flagship, Harbor Village, Sack of Loot, Shaman • Broker, Forts, Innkeeper, Modify, Fawning, Sycophant ",
  "Buried and Sunk: Bury • Abundance, Buried Treasure, King's Cache, Landing Party, Maroon • Courier, Highwayman, Shy, Merchant Camp, Odysseys, Skirmisher,",
];
Kingdoms["guildscornucopia"] = [
" Misfortune: Advisor, Candlestick Maker, Doctor, Fairgrounds, Farming Village, Fortune Teller, Horse Traders, Jester, Soothsayer, Taxman",
" Baking Contest: Baker, Farming Village, Harvest, Herald, Journeyman, Masterpiece, Menagerie, Remake, Stonemason, Tournament",

" Bounty of the Hunt: Harvest, Horn of Plenty, Hunting Party, Menagerie, Tournament • Cellar, Festival, Militia, Moneylender, Smithy",
" Bad Omens: Fortune Teller, Hamlet, Horn of Plenty, Jester, Remake • Bureaucrat, Laboratory, Merchant, Poacher, Throne Room",
" The Jester's Workshop: Fairgrounds, Farming Village, Horse Traders, Jester, Young Witch • Artisan, Laboratory, Market, Remodel, Workshop • Bane: Merchant",
" Arts & Crafts: Stonemason, Advisor, Baker, Journeyman, Merchant Guild • Laboratory, Cellar, Workshop, Festival, Moneylender",
" Clean Living: Butcher, Baker, Candlestick Maker, Doctor, Soothsayer • Bandit, Militia, Moneylender, Gardens, Village",
" Gilding the Lily: Plaza, Masterpiece, Candlestick Maker, Taxman, Herald • Library, Merchant, Remodel, Market, Sentry",

" Last Laughs: Farming Village, Harvest, Horse Traders, Hunting Party, Jester • Minion, Nobles, Pawn, Steward, Swindler",
" The Spice of Life: Fairgrounds, Horn of Plenty, Remake, Tournament, Young Witch • Courtier, Courtyard, Diplomat, Mining Village, Replace • Bane: Wishing Well",
" Small Victories: Fortune Teller, Hamlet, Hunting Party, Remake, Tournament • Conspirator, Duke, Harem, Pawn, Secret Passage",
" Name That Card: Baker, Doctor, Plaza, Advisor, Masterpiece • Courtyard, Harem, Nobles, Replace, Wishing Well",
" Tricks of the Trade: Stonemason, Herald, Soothsayer, Journeyman, Butcher • Conspirator, Masquerade, Mill, Nobles, Secret Passage",
" Decisions, Decisions: Merchant Guild, Candlestick Maker, Masterpiece, Taxman, Butcher • Bridge, Pawn, Mining Village, Upgrade, Duke",

" Collector: Fairgrounds, Farming Village, Fortune Teller, Harvest, Hunting Party • Embargo, Fishing Village, Merchant Ship, Navigator, Smugglers",
" Collider: Menagerie, Horn of Plenty, Horse Traders, Jester, Tournament • Lighthouse, Salvager, Treasure Map, Treasury, Warehouse",
" Ghosts & Taxes: Butcher, Candlestick Maker, Herald, Soothsayer, Taxman • Cutpurse, Ghost Ship, Haven, Outpost, Smugglers",
" Island Builder: Baker, Doctor, Merchant Guild, Plaza, Stonemason • Island, Native Village, Salvager, Tactician, Treasury",

" Clown College: Jester, Remake, Harvest, Horse Traders, Menagerie • University, Golem, Alchemist, Philosopher's Stone, Familiar",
" Wine & Dine: Young Witch, Hamlet, Hunting Party, Fairgrounds, Horn of Plenty • Apprentice, Scrying Pool, Apothecary, Transmute, Vineyard • Bane: Herbalist",
" Illuminati: Butcher, Herald, Masterpiece, Merchant Guild, Stonemason • Apprentice, Golem, Philosopher's Stone, Scrying Pool, University",
" Tonics & Toxins: Baker, Candlestick Maker, Doctor, Plaza, Soothsayer • Alchemist, Familiar, Herbalist, Transmute, Vineyard",

" Detours: Farming Village, Horn of Plenty, Jester, Remake, Tournament • Rabble, Peddler, Hoard, Trade Route, Venture",
" Quarrymen: Baker, Merchant Guild, Soothsayer, Stonemason, Taxman • Mountebank, City, Expand, Grand Market, Quarry",
" Metal & Meat: Butcher, Candlestick Maker, Plaza, Stonemason, Taxman • Forge, King's Court, Monument, Venture, Watchtower",
" Penny Pinching: Advisor, Doctor, Herald, Journeyman, Merchant Guild • Bank, Counting House, Goons, Peddler, Royal Seal",

" Blue Harvest: Hamlet, Horn of Plenty, Horse Traders, Jester, Tournament • Fool's Gold, Mandarin, Noble Brigand, Trader, Tunnel",
" Traveling Circus: Fairgrounds, Farming Village, Hunting Party, Jester, Menagerie • Border Village, Embassy, Fool's Gold, Nomad Camp, Oasis",
" Exchanges: Butcher, Herald, Masterpiece, Soothsayer, Stonemason • Border Village, Develop, Ill-Gotten Gains, Stables, Trader",
" Road to Riches: Advisor, Baker, Candlestick Maker, Journeyman, Merchant Guild • Crossroads, Farmland, Highway, Spice Merchant, Tunnel",

" Dark Carnival: Fairgrounds, Hamlet, Horn of Plenty, Menagerie • Band of Misfits, Cultist, Fortress, Hermit, Junk Dealer, Knights",
" To the Victor: Harvest, Hunting Party, Remake, Tournament • Bandit Camp, Counterfeit, Death Cart, Marauder, Pillage, Sage",
" Stoneground: Advisor, Baker, Candlestick Maker, Plaza, Stonemason • Hunting Grounds, Ironmonger, Procession, Marauder, Rogue",
" Class Struggle: Butcher, Doctor, Journeyman, Merchant Guild, Taxman • Feodum, Fortress, Knights, Market Square, Poor House",

" The Hero's Return: Travelling Fair • Fairgrounds, Farming Village, Horse Traders, Jester, Menagerie • Artificer, Miser, Page, Ranger, Relic",
" Seacraft and Witchcraft: Ferry, Seaway • Fortune Teller, Hamlet, Horn of Plenty, Tournament, Young Witch • Peasant, Storyteller, Swamp Hag, Transmogrify, Wine Merchant • Bane: Guide",
" Spendthrift: Lost Arts • Doctor, Masterpiece, Merchant Guild, Soothsayer, Stonemason • Artificer, Gear, Magpie, Miser, Storyteller",
" Queen of Tan: Pathfinding, Save • Advisor, Butcher, Candlestick Maker, Herald, Journeyman • Coin of the Realm, Duplicate, Guide, Ratcatcher, Royal Carriage",

" Zookeepers: Annex, Colonnade • Fairgrounds, Horse Traders, Menagerie, Jester, Tournament • Overlord, Sacrifice, Settlers/Bustling Village, Villa, Wild Hunt",
" Cash Flow: Baths, Mountain Pass • Baker, Butcher, Doctor, Herald, Soothsayer • Castles, City Quarter, Engineer, Gladiator/Fortune, Royal Blacksmith",

" The Endless Fair: Baker, Fairgrounds, Farming Village, Fortune Teller, Merchant Guild • Devil's Workshop, Exorcist, Monastery, Pixie, Shepherd",
" Happy Chaos: Doctor, Harvest, Herald, Jester, Masterpiece • Blessed Village, Changeling, Fool, Faithful Hound, Sacred Grove ",
]
Kingdoms["guildscornucopia2"] = [
  "Misfortune: Advisor, Candlestick Maker, Carnival, Fairgrounds, Farmhands, Horn of Plenty, Infirmary, Jester, Merchant Guild, Soothsayer ",
  "Baking Contest:  Baker, Farrier, Hamlet, Herald, Hunting Party, Joust, Menagerie, Remake, Shop, Stonemason ",

  "Bounty of the Hunt: Ferryman (Farrier), Horn of Plenty, Hunting Party, Joust, Menagerie • Cellar, Festival, Militia, Moneylender, Smithy ",
  "Gilding the Lily: Candlestick Maker, Footpad, Plaza, Remake, Young Witch (Vassal) • Library, Merchant, Remodel, Market, Sentry ",

  "The Spice of Life: Fairgrounds, Horn of Plenty, Joust, Remake, Young Witch (Wishing Well) • Courtier, Courtyard, Diplomat, Mining Village, Replace ",
  "Tricks of the Trade: Butcher, Herald, Journeyman, Stonemason, Soothsayer • Conspirator, Masquerade, Mill, Nobles, Secret Passage ",

  "Collecting: Fairgrounds, Farmhands, Farrier, Footpad, Hunting Party • Blockade, Fishing Village, Monkey, Smugglers, Tide Pools ",
  "Island Builder: Advisor, Baker, Merchant Guild, Plaza, Stonemason • Island, Native Village, Salvager, Sea Chart, Treasury ",

  "Clown College: Candlestick Maker, Carnival, Herald, Infirmary, Jester, Menagerie • Apothecary, Familiar, Golem, University  ",

  "Detours: Farmhands, Horn of Plenty, Jester, Joust, Remake • Clerk, Crystal Ball, Forge, Hoard, Magnate ",
  "Quarrymen: Baker, Butcher, Candlestick Maker, Merchant Guild, Soothsayer • Charlatan, City, Expand, Grand Market, Quarry ",

  "Blue Harvest: Farrier, Ferryman (Guard Dog), Hamlet, Horn of Plenty, Joust • Fool's Gold, Trail, Tunnel, Weaver, Witch's Hut ",
  "Exchanges: Butcher, Herald, Soothsayer, Stonemason, Young Witch (Oasis) • Border Village, Cauldron, Develop, Stables, Trader",

  "Dark Carnival: Fairgrounds, Ferryman (Fortress), Hamlet, Horn of Plenty, Menagerie • Cultist, Death Cart, Hermit, Junk Dealer, Knights ",
  "Stoneground: Advisor, Farrier, Plaza, Shop, Stonemason • Hunting Grounds, Ironmonger, Procession, Marauder, Rogue",

  "The Hero's Return: Travelling Fair • Carnival, Farmhands, Footpad, Menagerie, Shop • Artificer, Miser, Page, Ranger, Relic ",
  "Queen of Tan: Pathfinding, Save • Advisor, Herald, Journeyman, Merchant Guild, Young Witch (Coin of the Realm) • Duplicate, Guide, Transmogrify, Ratcatcher, Royal Carriage ",

  "Zookeepers: Annex, Colonnade • Ferryman (Villa), Menagerie, Jester, Remake, Shop • Groundskeeper, Overlord, Sacrifice, Settlers/Bustling Village, Wild Hunt ",
  "Cash Flow: Baths, Mountain Pass • Baker, Carnival, Herald, Infirmary, Soothsayer • Castles, City Quarter, Engineer, Gladiator/Fortune, Royal Blacksmith ",

  "The Endless Fair:  Baker, Carnival, Fairgrounds, Farmhands, Merchant Guild • Devil's Workshop, Exorcist, Monastery, Pixie, Shepherd ",
  "Happy Chaos: Carnival, Infirmary, Jester, Shop, Young Witch (Leprechaun) • Blessed Village, Changeling, Faithful Hound, Sacred Grove, Secret Cave ",

  "Combo Corner:  Canal • Farrier, Ferryman (Mountain Village), Horn of Plenty, Jester, Stonemason • Ducat, Experiment, Hideout, Sculptor, Seer ",
  "Filling the Coffers: City Gate, Star Chart • Baker, Butcher, Farrier, Merchant Guild, Plaza • Priest, Recruiter, Spices, Swashbuckler, Treasurer ",

  "Living in Exile:  Enclave, Way of the Mule • Farmhands, Footpad, Hamlet, Infirmary, Journeyman • Gatekeeper, Hostelry, Livery, Scrap, Stockpile ",
  "Thrill of the Hunt: Pursue, Way of the Rat • Butcher, Carnival, Hamlet, Hunting Party, Joust •  Black Cat, Bounty Hunter, Camel Train, Mastermind, Village Green",

  "Huge Collections:  Woodworkers' Guild • Advisor, Fairgrounds, Hunting Party, Plaza, Shop • Clashes, Contract, Forts, Galleria, Sentinel ",
  "Forest Scouts: Forest Dwellers • Butcher, Candlestick Maker, Farmhands, Footpad, Journeyman • Augurs, Emissary, Innkeeper, Royal Galley, Sentinel ",

  "Of Heralds and Hunters:  Fairgrounds, Herald, Infirmary, Soothsayer, Stonemason • Cabin Boy, Flagship, Inspiring, Fortune Hunter, Pendant, Pickaxe",
  "Through the Swamp: Journey • Baker, Hamlet, Horn of Plenty, Menagerie, Merchant Guild • Cage, Patient, Pilgrim, Swamp Shacks, Taskmaster, Tools",
];
Kingdoms["alchemy"] = [
  "Forbidden Arts: Apprentice, Familiar, Possession, University, Cellar, Council Room, Gardens, Laboratory, Thief, Throne Room",
  "Potion Mixers: Alchemist, Apothecary, Golem, Herbalist, Transmute, Cellar, Chancellor, Festival, Militia,  Smithy",
  "Chemistry Lesson: Alchemist, Golem, Philosopher's Stone, University, Bureaucrat, Market, Moat, Remodel, Witch,  Woodcutter",

  "Servants: Golem, Possession, Scrying Pool, Transmute, Vineyard, Conspirator, Great Hall, Minion, Pawn,  Steward",
  "Secret Research: Familiar, Herbalist, Philosopher's Stone, University, Bridge, Masquerade, Minion, Nobles, Shanty Town,  Torturer",
  "Pools, Tools, and Fools: Apothecary, Apprentice, Golem, Scrying Pool, Baron, Coppersmith, Ironworks, Nobles, Trading Post,  Wishing Well",
];
Kingdoms["risingsun"] = [
"Heading East: Progress • Alley, Artist, Craftsman, Fishmonger, Litter, Rice, River Shrine, Rustic Village, Samurai, Tea House",
"Dawn of an Era: Kind Emperor, Practice • Aristocrat, Change, Daimyo, Gold Mine, Imperial Envoy, Kitsune, Mountain Shrine, Ninja, Rice Broker, Ronin", 

"Spring Forward: Rapid Expansion • Gold Mine, Mountain Shrine, Riverboat (Market), Root Cellar, Tanuki • Artisan, Harbinger, Smithy, Throne Room, Workshop",
"Money to Burn: Panic, Gather • Change, Craftsman, Poet, Ronin, Snake Witch • Bureaucrat, Cellar, Festival, Merchant, Poacher",

"Solving the Puzzle: Enlightenment • Artist, Gold Mine, Mountain Shrine, Riverboat (Upgrade), Ronin • Conspirator, Courtier, Ironworks, Lurker, Wishing Well",
"Cold Calculation: Harsh Winter, Amass • Craftsman, Ninja, Snake Witch, Tea House, Tanuki • Baron, Diplomat, Duke, Secret Passage, Shanty Town",

"Invasion Fleet: Approaching Army • Alley, Kitsune, Ninja, Rice Broker, Riverboat (Bazaar) • Blockade, Corsair, Outpost, Salvager, Sea Chart, Treasure Map",
"Island People: Great Leader, Kintsugi • Craftsman, Imperial Envoy, Rice, River Shrine, Snake Witch • Caravan, Haven, Pirate, Sea Witch, Tide Pools ",

"Fast Track: Progress • Fishmonger, Imperial Envoy, Riverboat (Apprentice), Root Cellar, Rustic Village, Samurai • Alchemist, Golem, University, Vineyard ",
"Lazy Mischief: Biding Time, Receive Tribute • Alley, Aristocrat, Change, Kitsune, Litter, Ninja • Apothecary, Familiar, Herbalist, Transmute ",

"River Trade: Flourishing Trade • Craftsman, Litter, River Shrine, Riverboat (City), Root Cellar • Anvil, Collection, Crystal Ball, Grand Market, War Chest ",
"Autumn Harvest: Good Harvest, Continue • Aristocrat, Change, Imperial Envoy, Ninja, Rustic Village • Bank, Investment, Magnate, Quarry, Watchtower ",

"Winter Solstice: Harsh Winter • Change, Daimyo, Gold Mine, Snake Witch, Tea House • Advisor, Baker, Farrier, Hunting Party, Jester ",
"From the Shadows: Rapid Expansion, Gather • Alley, Artist, Fishmonger, Poet, Tanuki • Carnival, Farmhands, Horn of Plenty, Infirmary, Shop",

"Swift Hands: Progress • Alley, Ronin, Rustic Village, Samurai, Snake Witch • Cauldron, Haggler, Oasis, Scheme, Weaver ",
"aperwork: Bureaucracy, Foresight • Craftsman, Imperial Envoy, River Shrine, Riverboat (Witch's Hut), Tanuki • Border Village, Crossroads, Spice Merchant, Tunnel, Wheelwright ",

"Pandemic: Sickness • Aristocrat, Fishmonger, Litter, Mountain Shrine, Rice Broker • Catacombs, Procession, Rogue, Scavenger, Vagrant ",
"Distant Hordes: Approaching Army, Asceticism • Poet, Rice, Ronin, Samurai, Snake Witch • Armory, Forager, Hermit, Hunting Grounds, Knights, Squire ",

"Wanderers: Flourishing Trade, Ball • Imperial Envoy, Litter, Poet, Ronin, Tanuki • Amulet, Caravan Guard, Guide, Hireling, Miser ",
"Hero's Journey: Biding Time, Kintsugi • Aristocrat, Artist, Kitsune, Root Cellar, Samurai • Artificer, Distant Lands, Dungeon, Duplicate, Page", 

"Summer Castles: Kind Emperor, Museum • Aristocrat, Change, Rice, River Shrine, Snake Witch • Capital, Castles, City Quarter, Forum, Patrician/Emporium ",
"Swept Clean: Divine Wind, Sea Trade • Artist, Kitsune, Mountain Shrine, Rice Broker, Root Cellar • Chariot Race, Charm, Crown, Overlord, Temple ",

"Priceless Rice: Growth • Alley, Daimyo, Rice, Samurai, Tea House • Blessed Village, Cursed Village, Devil's Workshop, Faithful Hound, Shepherd ",
"Dark Corners: Sickness, Amass • Artist, Gold Mine, Litter, River Shrine, Tanuki • Changeling, Conclave, Sacred Grove, Skulk, Werewolf ",

"Mountain of Money: Bureaucracy, Guildhall • Alley, Gold Mine, Kitsune, Rice Broker, Riverboat (Seer) • Ducat, Experiment, Hideout, Scholar, Treasurer ",
"Fresh Start: Divine Wind, Receive Tribute • Change, Daimyo, Ninja, Poet, Tea House • Border Guard, Cargo Ship, Inventor, Patron, Sculptor ",

"Become the Ox: Enlightenment, Way of the Ox • Aristocrat, Artist, Fishmonger, Poet, Samurai • Animal Fair, Camel Train, Destrier, Livery, Wayfarer ",
"Alternatives: Panic, Sea Trade • Alley, Craftsman, Daimyo, Ronin, Rustic Village • Bounty Hunter, Coven, Paddock, Sleigh, Supplies ",

"Expert Traders: Enlightenment, Crafter's Guild • Daimyo, Fishmonger, Rice Broker, Riverboat (Barbarian), Rustic Village • Augurs, Contract, Courier, Hunter, Swap ",
"Feverish Crafting: Rapid Expansion, Credit • Aristocrat, Craftsman, Fishmonger, Snake Witch, Tea House • Capital City, Clashes, Innkeeper, Marquis, Skirmisher  ",

"Buried in Booty: Growth, Prosper • Gold Mine, Ninja, Poet, Rice Broker, Tanuki • First Mate, Flagship, King's Cache, Pendant, Taskmaster ",
"Shiny Things: Good Harvest, Credit • Daimyo, Litter, Rice, River Shrine, Root Cellar • Cabin Boy, Cutthroat, Jewelled Egg, Pilgrim, Tools "

];

//==============================================================
const argv = process.argv.slice(2); // Get arguments excluding script name and potentially the output directory
PROCESSING_DIR = getProcessingDir(argv);
GenerateKingdom("risingsun");

function TestAndCreateDir(Path) {
  if (!fs.existsSync(Path)) fs.mkdirSync(Path, { recursive: true });
}

function getProcessingDir(argv) {
  // Check if an argument is provided for the output directory
  if (argv.length > 2) {
    console.warn("Ignoring extra arguments. Only the first argument is used for output directory.");
  }
  const processingDirArg = argv[0];
  console.log("processingDirArg", processingDirArg)
  return processingDirArg ? PROCESSING_DIR.replace(PROCESSED, processingDirArg) : PROCESSING_DIR;
}

function findCardByShortId(shortId) {
  // Loop through each set and its cards/events/etc.
  for (const setId in sets) {
    const currentSet = sets[setId];
    if (currentSet.cards) {
      for (const card of currentSet.cards) {
        if (card.shortId === shortId) return card;
      }
    }
    if (currentSet.events) {
      for (const event of currentSet.events) {
        if (event.shortId === shortId) return event;
      }
    }
    if (currentSet.landmarks) {
      for (const landmark of currentSet.landmarks) {
        if (landmark.shortId === shortId) return landmark;
      }
    }
    if (currentSet.projects) {
      for (const project of currentSet.projects) {
        if (project.shortId === shortId) return project;
      }
    }
    if (currentSet.boons) {
      for (const boon of currentSet.boons) {
        if (boon.shortId === shortId) return boon;
      }
    }
    if (currentSet.ways) {
      for (const way of currentSet.ways) {
        if (way.shortId === shortId) return way;
      }
    }
    if (currentSet.allies) {
      for (const ally of currentSet.allies) {
        if (ally.shortId === shortId) return ally;
      }
    }
    if (currentSet.traits) {
      for (const trait of currentSet.traits) {
        if (trait.shortId === shortId) return trait;
      }
    }
    if (currentSet.prophecies) {
      for (const prophecy of currentSet.prophecies) {
        if (prophecy.shortId === shortId) return prophecy;
      }
    }
  }
  // Throw an error if no card is found
  throw new Error("Card not found: " + shortId);
}

function getSetsForCards(cards) {
  const setIdsMap = {};
  for (const card of cards) {
    if (card.hasOwnProperty("setId")) {
      setIdsMap[card.setId] = true;
    }
  }
  const setIds = Array.from(new Set(Object.keys(setIdsMap))).sort();
  return setIds;
}

function parseSupplyString(supplyString) {
  const split = supplyString.split(":");
  // Check if card names exist
  // Trim leading and trailing whitespace from the kingdom name
  const kingdomName = split[0].trim();
  if (split.length < 2 || !split[1]) {
    return { name: kingdomName, cards: [] }; // Handle empty card list
  }
  if (split.length > 2) split[1]= split[1] + ", " + split[2];

  // Split card names by commas, replacing special characters
  const cardNames = split[1]
    .replace(/Bane/, "")
    .replace(/\//g, "") // Replace forward slash with nothing
    .replace(/\(/g, ",") // Replace opening parenthesis with comma
    .replace(/\)/g, "") // Replace closing parenthesis with nothing
    .replace(/->/g, ",") // Replace closing parenthesis with comma
    .replace(/•/g, ",") // Replace bullet point with comma
    .split(",");

  const cards = [];
  for (const cardName of cardNames) {
    // Call Loader.tokenize (assuming it exists) and store the result
    const tokenized = tokenize(cardName);
    if (tokenized) {
      cards.push(findCardByShortId(tokenized));
    }
  }
  // Return an object containing kingdom name and cards array
  return {
    name: kingdomName,
    cards: cards,
  };
}

function GenerateKingdom(listOfKingdoms) {
  TestAndCreateDir(PROCESSING_DIR);
  const myFileWriter = new fs.createWriteStream(`${PROCESSING_DIR}//${listOfKingdoms}.yaml`);
  myFileWriter.write("kingdoms:" + '\n');
  for (const string of Kingdoms[listOfKingdoms]) {
    const kingdom = parseSupplyString(string);
    myFileWriter.write("  - name: " + kingdom.name + '\n');
    console.log("  - name: " + kingdom.name);

    const setIds = getSetsForCards(kingdom.cards);
    myFileWriter.write("    sets:" + '\n');
    //console.log("    sets:");
    for (const setId of setIds) {
      myFileWriter.write("      - " + setId + '\n');
      //console.log("      - " + setId);
    }

    const cardCategories = {
      supplies: [], // Array to store Supply card names
      events: [], // Arrays for other categories
      landmarks: [],
      projects: [],
      boons: [],
      allies: [],
      traits: [],
      prophecies: [],
    };

    const cardIds = [...kingdom.cards]
      .map((card) => ({ name: card.id, set: card.setId, type: card.cardType }))
      .sort((cardA, cardB) => {
        // Sort by type first
        if (cardA.type !== cardB.type) {
          return cardA.type < cardB.type ? -1 : 1;
        }
        // If types are the same, sort by set
        if (cardA.set !== cardB.set) {
          return cardA.set < cardB.set ? -1 : 1;
        }
        // If types and sets are the same, sort by name
        return cardA.name < cardB.name ? -1 : 1;
      });

    for (const cardId of cardIds) {
      const categoryRegex = /(supplies|events|landmarks|projects|boons|allies|traits|prophecies)/; // Regex for category names
      const categoryMatch = cardId.type.match(categoryRegex); // Check for category match
      //console.log(cardId.type, categoryMatch)
      if (categoryMatch) {
        const category = categoryMatch[1].toLowerCase(); // Get the matched category name (lowercase)
        if (cardCategories[category]) {
          cardCategories[category].push(cardId.name);
        }
      }
    }
    
    // Print each category and its cards
    for (const category in cardCategories) {
      if (cardCategories[category].length > 0) {
        // Check if category has cards
        category == "supplies" ? 
            myFileWriter.write("    " + "supply" + ":" + '\n'):
            myFileWriter.write("    " + category + ":" + '\n');
        for (const cardName of cardCategories[category]) {
          myFileWriter.write("      - " + cardName + '\n');
        }
      }
    }
    if (cardCategories.supplies.length >10 ) {
      myFileWriter.write("============================================> need to look at " +kingdom.name + '\n');
      myFileWriter.write(string + '\n');
      console.log ("============================================> More than 10 supplies : need to look at ", kingdom.name)
    }
    if (cardCategories.traits.length > 0) {
      myFileWriter.write("============================================> need to look at " +kingdom.name + '\n');
      myFileWriter.write(string + '\n');
      console.log ("============================================> trait presence :  need to look at ", kingdom.name)
    }
    /* if (cardCategories.prophecies.length > 0) {
      myFileWriter.write("============================================> need to look at " +kingdom.name + '\n');
      myFileWriter.write(string + '\n');
      console.log ("============================================> prophecy presence :  need to look at ", kingdom.name)
    } */
    myFileWriter.write('\n');

    //console.log(cardIds);
  }
}

