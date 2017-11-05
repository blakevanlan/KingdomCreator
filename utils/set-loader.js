const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');

const tokenize = function(str) {
   return str.replace(/[\s'-\/]/g, '').toLowerCase();
};

const convertToCardId = function(setId, name) {
   return setId + '_' + tokenize(name);
};

const convertToEventId = function(setId, name) {
   return setId + '_event_' + tokenize(name);
};

const convertToLandmarkId = function(setId, name) {
   return setId + '_landmark_' + tokenize(name);
};

const loadSets = function() {
   sets = {};
   setDirectory = path.join(__dirname, '../sets');
   setFiles = fs.readdirSync(setDirectory);

   for (var i = 0; i < setFiles.length; i++) {
      filename = path.join(setDirectory, setFiles[i]);
      id = tokenize(path.basename(setFiles[i], '.yaml'));
      sets[id] = yaml.safeLoad(fs.readFileSync(filename, 'utf8'));
      sets[id].id = id;
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
            card.id = convertToEventId(setId, card.name);
            card.shortId = tokenize(card.name);
            card.setId = setId;
         }
      }
      if (set.landmarks) {
         for (var i = 0; i < set.landmarks.length; i++) {
            var card = set.landmarks[i];
            card.id = convertToLandmarkId(setId, card.name);
            card.shortId = tokenize(card.name);
            card.setId = setId;
         }
      }
   }
   return sets;
};

module.exports = {
   tokenize: tokenize,
   convertToCardId: convertToCardId,
   convertToEventId: convertToEventId,
   convertToLandmarkId: convertToLandmarkId,
   loadSets: loadSets
};
