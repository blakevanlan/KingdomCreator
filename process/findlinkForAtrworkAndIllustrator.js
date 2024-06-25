import axios from 'axios';
import Loader from './loader.js'; // Assuming loader.js uses ES modules
const sets = Loader.loadSets(); // Assuming loadSets is async function

let Request = ""
let matchExpr = ""

async function getInfos(InfoType, cards) {
  for (let i = 0; i < cards.length; i++) {
    switch (InfoType) {
      case 'Illustrator':
      case 'Artwork':
        await getCardInfo((cards[i]), InfoType)
        break;
      default:
        console.log("Invalid InfoType")
    } 
  }
} 

function getAllSetsInfo() {
  for (var k in sets) {
    console.log("set :", k)
    getInfos("Artwork", getCards(sets[k]));
    getInfos("Illustrator", getCards(sets[k]));
  }
  return;
}

async function getCardInfo(card, type) {
  switch (type) {
    case 'Artwork':
      Request= `https://wiki.dominionstrategy.com/index.php/File:${card.name.replace(/\s/g, "_")}Art.jpg`;
      matchExpr = /class="fullImageLink" id="file"><a href="(\/images\/[^.]+)/
      break
    case 'Illustrator':
      cleanCardName(card)
      Request= `https://wiki.dominionstrategy.com/index.php/${card.name.replace(/\s/g, "_")}`; 
      matchExpr = /Illustrator\(s\)<.th>[ |\n]+<td class="" style="">[ |\n]+<a href=".index.php.[^>]+>([^<]+)<.a>/
      break 
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


//getAllSetsInfo();  // to process all known sets

getInfos("Illustrator",getCards(sets.prosperity2add)); // to process 1 set 

//getAllIllustrators(getCards(sets.prosperity2add).filter(card => card.name != "Sauna / Avanto")); // to process 1 set )
//getAllIllustrators(getCards(sets.alchemy).filter(card => card.name != "Sauna / Avanto")); // to process 1 set )
//getAllIllustrators(getCards(sets.guilds).filter(card => card.name != "Sauna / Avanto")); // to process 1 set )
//getAllIllustrators(getCards(sets.cornucopia).filter(card => card.name != "Sauna / Avanto")); // to process 1 set )
//getAllIllustrators(getCards(sets.guildscornucopia2add).filter(card => card.name != "Sauna / Avanto")); // to process 1 set )
//getAllIllustrators(getCards(sets.hinterlands).filter(card => card.name != "Sauna / Avanto")); // to process 1 set )
//getAllIllustrators(getCards(sets.empires).filter(card => card.name != "Sauna / Avanto")); // to process 1 set )
//getAllIllustrators(getCards(sets.nocturne).filter(card => card.name.includes("Will"))); // to process 1 set )
//getAllIllustrators(getCards(sets.renaissance).filter(card => card.name != "Sauna / Avanto")); // to process 1 set )
//getAllIllustrators(getCards(sets.plunder).filter(card => card.name != "Sauna / Avanto")); // to process 1 set )




//getAllIllustrators(getCards(sets.allies).filter(card => card.name.endsWith(" - to hide split card"))); // to process 1 set )

// ok
//getAllIllustrators(getCards(sets.menagerie).filter(card => card.name != "Sauna / Avanto")); // to process 1 set )
//getAllIllustrators(getCards(sets.allies).filter(card => card.name != "Sauna / Avanto")); // to process 1 set )
//getAllIllustrators(getCards(sets.empires).filter(card => card.name.endsWith("- to hide split card"))); // to process 1 set )

//getAllIllustrators(getCards(sets.promos).filter(card => card.name == "Sauna / Avanto")); // to process 1 set )