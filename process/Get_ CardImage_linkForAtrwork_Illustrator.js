import axios from 'axios';
import fs from 'fs/promises'; // Using promises for async/await
import Jfs from 'fs';

import Loader from './loader.js'; // read <set>.yaml
import resize from './resize.js'; // resize an Image

import select, { Separator } from '@inquirer/select';
import checkbox from '@inquirer/checkbox';
import { exit } from 'process';

const sets = Loader.loadSets(); // Assuming loadSets is async function

const WORK_CARDS = "processed/cards"
const DOC_IMG = "processed/docs/img/cards"

let Request = ""
let matchExpr = ""

async function getInfos(InfoType, cards) {
  for (let i = 0; i < cards.length; i++) {
    switch (InfoType) {
      case 'Illustrator':
      case 'Artwork':
      case 'CardImage':
        await getCardInfo((cards[i]), InfoType)
        break;
      default:
        console.log("Invalid InfoType")
    } 
  }
} 

async function getCardInfo(card, type) {
  cleanCardName(card)
  switch (type) {
    case 'Artwork':
      Request= `https://wiki.dominionstrategy.com/index.php/File:${card.name.replace(/\s/g, "_")}Art.jpg`;
      matchExpr = /class="fullImageLink" id="file"><a href="(\/images\/[^.]+)/
      break
    case 'Illustrator':
      Request= `https://wiki.dominionstrategy.com/index.php/${card.name.replace(/\s/g, "_")}`; 
      matchExpr = /Illustrator\(s\)<.th>[ |\n]+<td class="" style="">[ |\n]+<a href=".index.php.[^>]+>([^<]+)<.a>/
      break 
    case 'CardImage':
      Request= `https://wiki.dominionstrategy.com/index.php/File:${card.name.replace(/\s/g, "_")}.jpg`; 
      matchExpr = /class="fullImageLink" id="file"><a href="(\/images\/[^.]+)/
      break;
  }
  const response = await axios.get(Request)
      .catch(function (error) {
        console.log(`\n\n============> error getting URL: ${card.name}\n`);
      })
  if (!response || response.status != 200) {
    console.log(`============>Invalid URL: ${card.name}\n`);
    return;
  }
  const match = response.data.match(matchExpr);
  if (!match || match.length < 2) {
    console.log(`Unable to find match for URL: ${card.name}`);
    return;
  }
  switch (type) {
    case 'Artwork':
      console.log(`<img alt="File:${card.name}Art.jpg" src="${match[1]}.jpg" width="287" height="209"></img>`)
      break
    case 'Illustrator':
      console.log(`${card.setId}##${match[1]}##${card.name}`)
      break
    case 'CardImage':
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
    break;
  } 
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
  if (set.traits) cards.push(...set.traits);
  if (set.othercards) cards.push(...set.othercards
        .filter(card => card.type != "Mat Vertical")
        .filter(card => card.type != "Mat Horizontal")
        .filter(card => card.type != "Tokens")
        .filter(card => card.type != "advToken")
      );
  return cards;
}

function cleanCardName(card) {
  switch (card.setId) {
    case 'allies' :
      if (card.name.endsWith(" - to hide split card")) {
       card.name = card.name.replace(" - to hide split card", "");
      }
    break
    case 'empires' :
      if (card.name.includes(" / ") | card.name.endsWith(" - to hide split card")){
          card.name = card.name.replace(" - to hide split card", "").replace(" / ", "_");
      }
    break
    case 'promos' :
      if (card.name.includes(" / ")) {
        card.name = card.name.replace(" - to hide split card", "").replace(" / ", "_");
      }
    break
    default:  
  };
}

/*
 * Program main activity
 *  - give choice of information to retrieve: 
 *      Illustrator or Artwork or Card Image
 *  - Select 1 set (dominion expansion) to query
 *  - Within this set select either all the cards or a selection 
 *  
 *  Run GetInfos with type of information and cards list
 */

/* Define Illustrator or Artwork */
const type = await select({
  message: "Select a type: Illustrator or Artwork",
  choices: [
    { name: 'Illustrator', value: 'Illustrator' },
    { name: 'Artwork', value: 'Artwork' },
    { name: 'Card Image', value: 'CardImage' },
  ]});

/* Define Set to query */
const setChoices = Object.keys(sets).map(setName => ({ name: setName,
  value: setName }));

const selectedSet = await select({
  message: "Select a set",
  choices: setChoices,
  pageSize: 15,
  loop: false
});

/* Define Cards to query */
let selectedCards = await checkbox({
  message: "Select cards - no selection = Cancel",
  choices: [
    { name: 'All cards', value: 'ALL_CARDS'},
    new Separator(),
    ...getCards(sets[selectedSet]).map(card => ({
      name: card.name,
      value: card
    }))
  ],
  pageSize: 15,
  loop: false
});
if (selectedCards.includes('ALL_CARDS')) { selectedCards=getCards(sets[selectedSet]) }

/* Query */
getInfos(type, selectedCards);
if (selectedCards.length === 0) { console.log("No cards selected."); } 


