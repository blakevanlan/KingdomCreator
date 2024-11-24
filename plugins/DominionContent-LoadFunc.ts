import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';


function loadFilesFromDirectory(directory : string) {
  const values: any = {};
  const files = fs.readdirSync(directory);
  for (const filename of files) {
    const filePath = path.join(directory, filename);
    const stat = fs.statSync(filePath);
    if (!stat.isFile()) {
      console.warn(`Skipping non-file: ${filePath}`);
      continue;
    }
    if (!filePath.endsWith('.yaml')) {
      console.warn(`Skipping non-YAML file: ${filePath}`);
      continue;
    }
    const id = tokenize(path.basename(filename, '.yaml'));
    values[id] = yaml.load(fs.readFileSync(filePath, 'utf8'));
  }
  return values;
}

export function loadSets() {
  const sets = loadFilesFromDirectory(path.join(__dirname, '../sets'));
  // Add the id for each set.
  for (let setId in sets) {
    sets[setId].id = setId;
    // Create an id for each card.
    let set = sets[setId];
    const cardTypes: { [key: string]: string } = { 
        cards: 'cards', events: 'event', landmarks: 'landmark', projects: 'project', 
        boons: 'boon', ways: 'way', allies: 'ally', traits: 'trait', prophecies: 'prophecy', 
        othercards: 'other'};
    for (const cardType in set) {
      if (cardTypes[cardType]) {
        for (let i = 0; i < set[cardType].length; i++) {
          let card = set[cardType][i];
          card.id = convertToCardId(setId, card.name, cardTypes[cardType], card.type);
          card.shortId = tokenize(card.name);
          card.setId = setId;
        }
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

function convertToCardId(setId:string, name:string, cardtype:string, type:string) {
  let convert = ""

  switch (cardtype) {
    case '':
    case 'cards' :
      convert = `${setId}_${tokenize(name)}`
      break;
    case 'other' : 
      switch (type) {
        case 'advToken' : 
        case 'Tokens' :
        case 'Mat Horizontal' :
        case 'Mat Vertical' :
        case 'Mat Square' :
          convert = `${setId}_${cardtype}_${name.replace(/[\s'-\/]/g, '')}`
          break;
        default: 
          convert = `${setId}_${tokenize(name)}`
      }
      break
    default:
      convert = `${setId}_${cardtype}_${tokenize(name)}`
  }
  return convert;
}

function tokenize(str:string) {
  return str.replace(/[\s'-\/]/g, '').toLowerCase();
}