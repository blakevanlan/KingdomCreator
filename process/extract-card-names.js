fs = require("fs");
Loader = require('./loader');

// Read in the Dutch and German translations.
const csv = fs.readFileSync("./process/resources/dutch_german_translations.csv", "utf8");
const lines = csv.replace(/"/g, "").split(/\r?\n/);
const names = {};

for (let i = 0; i < lines.length; i++) {
  const [english, dutch, german] = lines[i].split(",");
  names[transformName(english)] = {"nl": dutch, "de": german};
}

function transformName(name) {
  return name.toLowerCase().replace(/'/g, "");
}

const sets = Loader.loadSets();
const result = {
  "en": {},
  "nl": {},
  "de": {}
};

const types = ["cards", "events", "landmarks", "projects", "boons"]
const languages = ["nl", "de"];

// Merge all items into a single list.
const setIds = Object.keys(sets);
let items = []
for (let i = 0; i < setIds.length; i++) {
  const set = sets[setIds[i]];
  for (let j = 0; j < types.length; j++) {
    if (set[types[j]]) {
      items = items.concat(set[types[j]]);
    }
  }
}

for (let i = 0; i < items.length; i++) {
  const id = items[i].id;
  const name = items[i].name;
  result["en"][id] = name;
  for (let n = 0; n < languages.length; n++) {
    const lang = languages[n];
    let parts = [name];
    if (name.indexOf(" / ") != -1) {
      parts = name.split(" / ");
    }
    let translatedParts = [];
    for (let j = 0; j < parts.length; j++) {
      if (names[transformName(parts[j])]) {
        translatedParts.push(names[transformName(parts[j])][lang]);
      }
    }
    if (translatedParts.length == parts.length) {
      result[lang][id] = translatedParts.join(" / ");
    } else {
      console.log("Skipping: ", name, ", ", lang);
    }
  }
}

const resultLanguages = Object.keys(result);
for (let i = 0; i < resultLanguages.length; i++) {
  const lang = resultLanguages[i];
  fs.writeFileSync(`./src/i18n/messages/cards.${lang}.json`, JSON.stringify(result[lang], null, 2));
}
