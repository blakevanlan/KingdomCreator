import path from 'path';
import fs from 'fs';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadFilesFromDirectory(directory) {
   const values = {};
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
      const cardTypes = {
         cards: 'supply', events: 'event', landmarks: 'landmark', projects: 'project',
         boons: 'boon', ways: 'way', allies: 'ally', traits: 'trait', prophecies: 'prophecy', othercards: 'other'
      };
      
      for (const cardType in set) {
         if (cardTypes[cardType]) {
            for (let i = 0; i < set[cardType].length; i++) {
               let card = set[cardType][i];
               card.id = convertToCardId(setId, card.name, cardTypes[cardType]=='other' ? card.type : cardTypes[cardType]);
               card.shortId = tokenize(card.name);
               card.setId = setId;
               card.cardType = transform(cardType);
            }
         }
      }
   }

   return sets;
}

function convertToCardId(setId, name, type) {
   let convert = ""
   switch (type) {
      case 'supply':
         convert = `${setId}_${tokenize(name)}`
         break;
      case 'other':
         convert = `${setId}_${type}_${tokenize(name)}`
         break;
      default:
         convert = `${setId}_${type}_${tokenize(name)}`
   }
   return convert;
}

export function tokenize(str) {
   return str.replace(/[\s'-\/]/g, '').toLowerCase();
}

function transform(cardType) {
   const LocalCardTypes = {
      cards: '0 // supplies', events: '1 // events', landmarks: '2 // landmarks', projects: '3 // projects',
      boons: '4 // boons', ways: '5 // ways', allies: '6 // allies', traits: '7 // traits', 
      prophecies: '8 // prophecies', othercards: '9 // others'}
      return LocalCardTypes[cardType];
}