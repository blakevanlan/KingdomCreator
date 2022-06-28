const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

module.exports = class DominionContentPlugin {
  apply(compiler) {
    compiler.hooks.emit.tap('DominionContentPlugin', (compilation) => {
      const script = "window.DominionSets=" + JSON.stringify(DominionContentPlugin.loadSets()) +
          ";window.DominionKingdoms=" + JSON.stringify(DominionContentPlugin.loadKingdoms()) + ";";

      // Insert into the webpack build as new file assets.
      // TODO: Include a hash and figure out how to pipe it into the template files.
      compilation.assets['dominion-content.js'] = {
        source: function() {
          return script;
        },
        size: function() {
          return script.length;
        }
      };
    });
  }

  static loadSets() {
    const sets = this.loadFilesFromDirectory(path.join(__dirname, '../sets'));

    // Add the id for each set.
    for (var setId in sets) {
      sets[setId].id = setId;
    }

    // Create an id for each card.
    for (var setId in sets) {
      var set = sets[setId];
      for (var i = 0; i < set.cards.length; i++) {
        var card = set.cards[i];
        card.id = this.convertToCardId(setId, card.name);
        card.shortId = this.tokenize(card.name);
        card.setId = setId;
      }

      if (set.events) {
        for (var i = 0; i < set.events.length; i++) {
          var card = set.events[i];
          card.id = this.convertToEventId(setId, card.name);
          card.shortId = this.tokenize(card.name);
          card.setId = setId;
        }
      }
      if (set.landmarks) {
        for (var i = 0; i < set.landmarks.length; i++) {
          var card = set.landmarks[i];
          card.id = this.convertToLandmarkId(setId, card.name);
          card.shortId = this.tokenize(card.name);
          card.setId = setId;
        }
      }
      if (set.projects) {
        for (var i = 0; i < set.projects.length; i++) {
          var card = set.projects[i];
          card.id = this.convertToProjectId(setId, card.name);
          card.shortId = this.tokenize(card.name);
          card.setId = setId;
        }
      }
      if (set.boons) {
        for (var i = 0; i < set.boons.length; i++) {
          var card = set.boons[i];
          card.id = this.convertToBoonId(setId, card.name);
          card.shortId = this.tokenize(card.name);
          card.setId = setId;
        }
      }
      if (set.ways) {
        for (var i = 0; i < set.ways.length; i++) {
          var card = set.ways[i];
          card.id = this.convertToWayId(setId, card.name);
          card.shortId = this.tokenize(card.name);
          card.setId = setId;
        }
      }
    }
    return sets;
  }

  static loadKingdoms() {
    const kingdoms = this.loadFilesFromDirectory(path.join(__dirname, '../kingdoms'));
    return kingdoms;
  }

  static loadFilesFromDirectory(directory) {
    const values = {};
    const files = fs.readdirSync(directory);
    for (let i = 0; i < files.length; i++) {
      const filename = path.join(directory, files[i]);
      const id = this.tokenize(path.basename(files[i], '.yaml'));
	  /* js-yamj v3 to v4
      values[id] = yaml.safeLoad(fs.readFileSync(filename, 'utf8')); */
	  values[id] = yaml.load(fs.readFileSync(filename, 'utf8'));
    }
    return values;
  }

  static convertToEventId(setId, name) {
    return `${setId}_event_${this.tokenize(name)}`;
  }

  static convertToLandmarkId(setId, name) {
    return `${setId}_landmark_${this.tokenize(name)}`;
  }

  static convertToProjectId(setId, name) {
    return `${setId}_project_${this.tokenize(name)}`;
  }

  static convertToBoonId(setId, name) {
    return `${setId}_boon_${this.tokenize(name)}`;
  }

  static convertToWayId(setId, name) {
    return `${setId}_way_${this.tokenize(name)}`;
  }

  static convertToCardId(setId, name) {
    return `${setId}_${this.tokenize(name)}`;
  }

  static tokenize(str) {
    return str.replace(/[\s'-\/]/g, '').toLowerCase();
  }
}

