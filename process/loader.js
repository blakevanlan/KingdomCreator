import path from 'path';
import fs from 'fs';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tokenize = (str) => str.replace(/[\s'-\/]/g, '').toLowerCase();
const convertToCardId = (setId, name) => setId + '_' + tokenize(name);
const convertToEventId = (setId, name) => setId + '_event_' + tokenize(name);
const convertToLandmarkId = (setId, name) => setId + '_landmark_' + tokenize(name);
const convertToProjectId = (setId, name) => setId + '_project_' + tokenize(name);
const convertToBoonId = (setId, name) => setId + '_boon_' + tokenize(name);
const convertToWayId = (setId, name) => setId + '_way_' + tokenize(name);
const convertToAllyId = (setId, name) => setId + '_ally_' + tokenize(name);
const convertToTraitId = (setId, name) => setId + '_trait_' + tokenize(name);

const loadFilesFromDirectory = function(directory) {
   const values = {};
   const files = fs.readdirSync(directory);
   for (const filename of files) {
      //if (filename.includes("2-add")) continue;
      const filePath = path.join(directory, filename);
      const id = tokenize(path.basename(filePath, '.yaml'));
      values[id] = yaml.load(fs.readFileSync(filePath, 'utf8'));
    }
   return values;
};

const loadSets = function() {
   const sets = loadFilesFromDirectory(path.join(__dirname, '../sets'));

   // Add the id for each set.
   for (const setId in sets) {
      sets[setId].id = setId;
   }

   // Create an id for each card.
   for (const setId in sets) {
      const set = sets[setId];
      for (let i = 0; i < set.cards.length; i++) {
        const card = set.cards[i];
        card.id = convertToCardId(setId, card.name);
        card.shortId = tokenize(card.name);
        card.setId = setId;
        card.cardType = "0 // supplies"; // Assuming default card type
      }
      if (set.events) {
         for (let i = 0; i < set.events.length; i++) {
            const card = set.events[i];
            card.id = convertToEventId(setId, card.name);
            card.shortId = tokenize(card.name);
            card.setId = setId;
            card.cardType="1 // events"
         }
      }
      if (set.landmarks) {
         for (let i = 0; i < set.landmarks.length; i++) {
            const card = set.landmarks[i];
            card.id = convertToLandmarkId(setId, card.name);
            card.shortId = tokenize(card.name);
            card.setId = setId;
            card.cardType="2 // landmarks"
         }
      }
      if (set.projects) {
         for (let i = 0; i < set.projects.length; i++) {
            const card = set.projects[i];
            card.id = convertToProjectId(setId, card.name);
            card.shortId = tokenize(card.name);
            card.setId = setId;
            card.cardType="3 // projects"
         }
      }
      if (set.boons) {
         for (let i = 0; i < set.boons.length; i++) {
            const card = set.boons[i];
            card.id = convertToBoonId(setId, card.name);
            card.shortId = tokenize(card.name);
            card.setId = setId;
            card.cardType="4 // boons"
         }
      }
      if (set.ways) {
         for (let i = 0; i < set.ways.length; i++) {
            const card = set.ways[i];
            card.id = convertToWayId(setId, card.name);
            card.shortId = tokenize(card.name);
            card.setId = setId;
            card.cardType="5 // ways"
         }
      }
      if (set.allies) {
         for (let i = 0; i < set.allies.length; i++) {
            const card = set.allies[i];
            card.id = convertToAllyId(setId, card.name);
            card.shortId = tokenize(card.name);
            card.setId = setId;
            card.cardType="6 // allies"
         }
      }
      if (set.traits) {
         for (let i = 0; i < set.traits.length; i++) {
            const card = set.traits[i];
            card.id = convertToTraitId(setId, card.name);
            card.shortId = tokenize(card.name);
            card.setId = setId;
            card.cardType="7 // traits"
         }
      }
      if (set.othercards) {
         for (let i = 0; i < set.othercards.length; i++) {
            const card = set.othercards[i];
            card.id = convertToCardId(setId, card.name);
            card.shortId = tokenize(card.name);
            card.setId = setId;
         }
      }
   }
   return sets;
};

const loadKingdoms = function() {
   const kingdoms = loadFilesFromDirectory(path.join(__dirname, '../kingdoms'));
   return kingdoms
};


export default  {
   tokenize,
   convertToCardId,
   convertToEventId,
   convertToLandmarkId,
   convertToBoonId,
   convertToWayId,
   convertToAllyId,
   convertToTraitId,
   loadSets,
   loadKingdoms
};