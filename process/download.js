import axios from 'axios';
import Loader from './loader.js'; // Assuming loader.js uses ES modules
import fs from 'fs/promises'; // Using promises for async/await
import Jfs from 'fs';
import resize from './resize.js'

const sets = Loader.loadSets(); // Assuming loadSets is async function

const WORK_CARDS = "processed/cards"
const DOC_IMG = "processed/docs/img/cards"
// Enable logging for debugging
const trace = false;

async function getAllImages(cards) {
  for (let i = 0; i < cards.length; i++) {
    console.log(cards[i].id);
    await getImage(cards[i]);
  }
}

async function getAllSetsImages() {
  for (var k in sets) {
    console.log("set :", k)
    await getAllImages(getCards(sets[k]));
  }
  return;
}

async function getImage(card) {
  console.log("Requesting : " + createPageUrl(card))

  const response = await axios.get(createPageUrl(card))
      .catch(function (error) {
        // handle error
        console.log(`\n\n============> error getting URL: ${card.name}\n`);
      })
  if (!response || response.status != 200) {
    console.log(`============>Invalid URL: ${card.name}\n`);
    return;
  }
  const match1 = response.data.match(/\.jpg\"\ssrc=\"(.+?.jpg)\"/);
  const match = response.data.match(/class="fullImageLink" id="file"><a href="(\/images\/[^.]+)/);

  if (!match || match.length < 2) {
    console.log(`Unable to find URL: ${card.name}`);
    return;
  }

  const imageUrl = `https://wiki.dominionstrategy.com${match[1]}.jpg`;
  console.log("matched : Getting " + imageUrl)
  const imageResponse = await axios.get( imageUrl, { responseType: "stream" });
  const tempFilename = `${WORK_CARDS}/${card.setId}/${card.id}.jpg`;

  await fs.mkdir(`${DOC_IMG}/${card.setId}`, { recursive: true }); // Create directories recursively
  await fs.mkdir(`${WORK_CARDS}/${card.setId}`, { recursive: true }); // Create directories recursively

  const writer = Jfs.createWriteStream(tempFilename);
  imageResponse.data.pipe(writer);

  return new Promise((resolve) => {
    writer.on("finish", () => {
      resize(tempFilename, `${DOC_IMG}/${card.setId}/${card.id}.jpg`);
      resolve();
    });
  });
}

function createPageUrl(card) {
  const name = card.name.replace(/\s/g, "_");
  return `https://wiki.dominionstrategy.com/index.php/File:${name}.jpg`;
}

// Function to get all cards from a set (including sub-categories)
function getCards(set) {
  const cards = set.cards || [];
  if (set.events) cards.push(...set.events);
  if (set.landmarks) cards.push(...set.landmarks);
  if (set.projects) cards.push(...set.projects);
  if (set.boons) cards.push(...set.boons);
  if (set.ways) cards.push(...set.ways);
  if (set.allies) cards.push(...set.allies);
  if (set.othercards) cards.push(...set.othercards);
  return cards;
}


//getAllSetsImages();  // to process all known sets
//getAllImages(getCards(sets.promos).filter(card => card.name != "Sauna / Avanto")); // to process 1 set 
getAllImages(getCards(sets.guildscornucopia2add).filter(card => card.name != "Sauna / Avanto")); // to process 1 set 

//getImage(sets.plunder.cards.filter(card => card.name == "Cage")[0]) // to process 1 card