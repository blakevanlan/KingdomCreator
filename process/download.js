const axios = require("axios");
const Loader = require("./loader");
const Fs = require("fs");
const resize = require("./resize");

const sets = Loader.loadSets()
const cards = getCards(sets.prosperity2);

getAllImages(cards);

async function getAllImages(cards) {
  for (let i = 0; i < cards.length; i++) {
    await getImage(cards[i]);
  }
}

async function getImage(card) {
  const response = await axios.get(createPageUrl(card));
  if (response.status != 200) {
    console.log(`Invalid URL: ${card.name}`);
    return;
  } 
  // const match = response.data.match(/Digital\.jpg\"\ssrc=\"(.+.jpg)\"/);
  const match = response.data.match(/class="fullImageLink" id="file"><a href="(\/images\/[^.]+Digital\.jpg)\"/);
  if (!match || match.length < 2) {
    console.log(`Unable to find URL: ${card.name}`);
    return;
  }
  const imageResponse = await axios.get(`http://wiki.dominionstrategy.com${match[1]}`, {
    responseType: "stream"
  });

  const tempFilename = `process/cards/${card.id}.jpg`;
  const writer = Fs.createWriteStream(tempFilename);
  imageResponse.data.pipe(writer);

  return new Promise((resolve) => {
    writer.on("finish", () => {
      resize(tempFilename, `docs/img/cards/${card.id}.jpg`);
      resolve();
    });
  });
}

function createPageUrl(card) {
  const name = card.name.replace(/\s/g, "_");
  return `http://wiki.dominionstrategy.com/index.php/File:${name}Digital.jpg`;
}

function getCards(set) {
  let cards = set.cards;
  if (set.events) {
    cards = cards.concat(set.events);
  }
  if (set.landmarks) {
    cards = cards.concat(set.landmarks);
  }
  if (set.projects) {
    cards = cards.concat(set.projects);
  }
  if (set.boons) {
    cards = cards.concat(set.boons);
  }
  if (set.ways) {
    cards = cards.concat(set.ways);
  }
  if (set.allies) {
    cards = cards.concat(set.allies);
  }
  return cards;
}