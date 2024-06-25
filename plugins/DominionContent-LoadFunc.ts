import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';


function loadFilesFromDirectory(directory : string) {
  const values: any = {};
  const files = fs.readdirSync(directory);
  for (const filename of files) {
    const filePath = path.join(directory, filename);
    const id = tokenize(path.basename(filename, '.yaml'));
    values[id] = yaml.load(fs.readFileSync(filePath, 'utf8'));
  }
  return values;
}

export function loadSets() {
  const sets = loadFilesFromDirectory(path.join(__dirname, '../sets'));
  // Add the id for each set.
  for (var setId in sets) {
    sets[setId].id = setId;
  }
  // Create an id for each card.
  for (var setId in sets) {
    var set = sets[setId];
    for (var i = 0; i < set.cards.length; i++) {
      var card = set.cards[i];
      card.id = convertToCardId(setId, card.name);
      card.shortId = tokenize(card.name);
      card.setId = setId;
    }
    if (set.events) {
      for (var i = 0; i < set.events.length; i++) {
        var card = set.events[i];
        card.id = convertTo_XX_Id(setId, card.name, 'event');
        card.shortId = tokenize(card.name);
        card.setId = setId;
      }
    }
    if (set.landmarks) {
      for (var i = 0; i < set.landmarks.length; i++) {
        var card = set.landmarks[i];
        card.id = convertTo_XX_Id(setId, card.name, 'landmark');
        card.shortId = tokenize(card.name);
        card.setId = setId;
      }
    }
    if (set.projects) {
      for (var i = 0; i < set.projects.length; i++) {
        var card = set.projects[i];
        card.id = convertTo_XX_Id(setId, card.name,'project');
        card.shortId = tokenize(card.name);
        card.setId = setId;
      }
    }
    if (set.boons) {
      for (var i = 0; i < set.boons.length; i++) {
        var card = set.boons[i];
        card.id = convertTo_XX_Id(setId, card.name, 'boon');
        card.shortId = tokenize(card.name);
        card.setId = setId;
      }
    }
    if (set.ways) {
      for (var i = 0; i < set.ways.length; i++) {
        var card = set.ways[i];
        card.id = convertTo_XX_Id(setId, card.name, 'way');
        card.shortId = tokenize(card.name);
        card.setId = setId;
      }
    }
    if (set.allies) {
      for (var i = 0; i < set.allies.length; i++) {
        var card = set.allies[i];
        card.id = convertTo_XX_Id(setId, card.name,'ally');
        card.shortId = tokenize(card.name);
        card.setId = setId;
      }
    }
    if (set.traits) {
      for (var i = 0; i < set.traits.length; i++) {
        var card = set.traits[i];
        card.id = convertTo_XX_Id(setId, card.name, 'trait');
        card.shortId = tokenize(card.name);
        card.setId = setId;
      }
    }
    if (set.othercards) {
      for (var i = 0; i < set.othercards.length; i++) {
        var card = set.othercards[i];
        card.id = convertToCardId(setId, card.name);
        card.shortId = tokenize(card.name);
        card.setId = setId;
      }
    }
  }
  return sets;
}

export function loadKingdoms() {
  const kingdoms = loadFilesFromDirectory(path.join(__dirname, '../kingdoms'));
  identifyTraitSuppliesForKingdoms(kingdoms);
  return kingdoms;
}

function identifyTraitSuppliesForKingdoms(kingdomsSets:any) {
  Object.values(kingdomsSets).forEach((kingdomSet:any) => {
    Object.values(kingdomSet).forEach((kingdoms:any) => {
      Object.values(kingdoms).forEach((kingdom:any) => {
        if (kingdom.traits) {
          kingdom.traitSupplies = [];
          kingdom.traits.forEach((trait:any, index:number) => {
            if (typeof trait !== 'string') {
              console.error(`Trait at index ${index} is not a string:`, trait);
              return;
            }
            const traitParts = trait.split('->');
            if (traitParts.length === 2) {
              kingdom.traits[index] = traitParts[0];
              kingdom.traitSupplies.push(traitParts[1]);
            }
          });
        }
      });
    });
  });
}

function convertTo_XX_Id(setId:string , name:string ,type:string) {
  return `${setId}_${type}_${tokenize(name)}`;
}


function convertToCardId(setId:string , name:string) {
  return `${setId}_${tokenize(name)}`;
}

function tokenize(str:string) {
  return str.replace(/[\s'-\/]/g, '').toLowerCase();
}