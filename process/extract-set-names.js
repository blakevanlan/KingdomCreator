fs = require("fs");
Loader = require('./loader');

function transformName(name) {
  return name.toLowerCase().replace(/'/g, "");
}

// Read in the Dutch and German translations.
const csv = fs.readFileSync("./process/resources/dutch_german_french_sets.csv", "utf8");
const lines = csv.replace(/"/g, "").split(/\r?\n/);
const names = {};

for (let i = 0; i < lines.length; i++) {
  const [english, dutch, german, french] = lines[i].split(",");
  names[transformName(english)] = {"nl": dutch, "de": german, "fr": french};
}

const sets = Loader.loadSets();
const setIds = Object.keys(sets);
const languages = ["nl", "de", "fr"];

for (let i = 0; i < languages.length; i++) {
  const lang = languages[i];
  const result = {};
  for (let j = 0; j < setIds.length; j++) {
    const set = sets[setIds[j]];
    result[setIds[j]] = names[transformName(set.name)][lang];
  }
  fs.writeFileSync(`./src/i18n/messages/sets.${lang}.json`, JSON.stringify(result, null, 2));
}
