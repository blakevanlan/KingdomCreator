const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');

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
         card.id = setId + '_' + tokenize(card.name);
         card.setId = setId
      }

      if (set.events) {
         for (var i = 0; i < set.events.length; i++) {
            var card = set.events[i];
            card.id = setId + '_event_' + tokenize(card.name);
            card.setId = setId
         }
      }
      if (set.landmarks) {
         for (var i = 0; i < set.landmarks.length; i++) {
            var card = set.landmarks[i];
            card.id = setId + '_landmark_' + tokenize(card.name);
            card.setId = setId
         }
      }
   }
   return sets;
};

const tokenize = function(str) {
   return str.replace(/[\s'-]/g, '').toLowerCase();
};

module.exports = {
   loadSets: loadSets
};
