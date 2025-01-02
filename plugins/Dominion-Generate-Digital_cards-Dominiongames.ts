import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx'; 

// for function Convert_to_CSV
const ArtworkFileDir = 'design'
const ArtworkFileName = 'artwork.xlsx'
const DigitalCardFileName = 'Dominion_games_'
const DigitalCardLandscapeFileName = 'digital-cards-landscape - '
const DigitalCardDir = 'src/dominion/digital_cards/french'

enum Orientation {
  PORTRAIT = 'portrait',
  LANDSCAPE = 'landscape'
}

// Fonction pour convertir le fichier xlsx de messages traduit en CSV
function Generate_Digitalcard_DominionGames_for_set (setid:string) {
  console.log("Starting Generation of Digital Card", setid);
  const inputfile = path.join(ArtworkFileDir, ArtworkFileName);
  const outputfile = path.join(DigitalCardDir, DigitalCardFileName + setid +'.ts');
  const outputLandscapeFile = path.join(DigitalCardDir, DigitalCardLandscapeFileName + setid +'.ts');
  XLSX.set_fs(fs);

  const workbook = XLSX.readFile(inputfile);  // Charger le fichier Excel source
  const worksheet = workbook.Sheets['DominionGames'];    // Sélectionner la feuille "Digital_cards"
  const ranges = getRange(setid, Orientation.PORTRAIT);     // Définir la plage à copier (A1:C250)
  let allData: any[] = [];
  ranges.forEach(range => {
    const mydata = XLSX.utils.sheet_to_json(worksheet, { range });
    allData = allData.concat(mydata);    // Concaténer les données de toutes les plages
  });
  // Convertir les données en une chaîne de caractères, chaque ligne étant séparée par des retours à la ligne
  //const textData = mydata.map(row => Object.values(row as string ).join('\t')).join('\n');
  const textData = `type FrenchCardTextsType = {[key: string]: string;};
export const FrenchCardTexts: FrenchCardTextsType = {}
${allData.map(row => Object.values(row as string).join('\t')).join('\n')}`;
  
  // Écrire les données dans le fichier texte
  fs.writeFileSync(outputfile, textData);

  const rangesLandscape = getRange(setid, Orientation.LANDSCAPE);
  allData = [];

  if (rangesLandscape.length != 0) {
    rangesLandscape.forEach(range => {
      const mydata = XLSX.utils.sheet_to_json(worksheet, { range });
      // Concaténer les données de toutes les plages
      allData = allData.concat(mydata);
    });

    // Convertir les données en une chaîne de caractères, chaque ligne étant séparée par des retours à la ligne
    //const textData = mydata.map(row => Object.values(row as string ).join('\t')).join('\n');
    const textDataLandscape = `import type { DigitalCard } from "./digital-cards-type";

export const Cards_list_${setid}: DigitalCard[] = [
${allData.map(row => Object.values(row as string).join('\t')).join('\n')}

];`;
    fs.writeFileSync(outputLandscapeFile, textDataLandscape);    // Écrire les données dans le fichier texte
  }
}

function getRange(setid:string, type: Orientation) {
  let rangeMap: { [key: string]: string [] } = {}  // Tableau associatif pour mapper les valeurs de setid aux valeurs de range
  switch (type) {
    case Orientation.PORTRAIT:
        rangeMap  = {
'Baseset': [ 'E1:E47' ],
'Alchemy': [ 'E47:E61' ],
'Seaside': [ 'E61:E87' ],
'Cornucopia': [ 'E87:E105' ],
'Prosperity': [ 'E105:E134' ],
'Intrigue': [ 'E134:E180' ],
'Guilds': [ 'E180:E193' ],
'Hinterlands': [ 'E193:E219' ],
'Darkages': [ 'E219:E275' ],
'Adventures': [ 'E275:E333' ],
'Empires': [ 'E333:E409' ],
'Nocturne': [ 'E409:E486' ],
'Renaissance': [ 'E486:E536' ],
'Promo': [ 'E536:E551' ],
'Ménagerie': [ 'E551:E649' ],
'Allies': [ 'E649:E727' ],
'Plunder': [ 'E727:E812' ],
'Guildscornucopia': [ 'E812:E826' ],
'RisingSun': [ 'E826:E876' ],

            // ... ajoutez les autres paires ici
              'setid10': ['range10']};
    break;
    case Orientation.LANDSCAPE:
      rangeMap  = {
            // ... ajoutez les autres paires ici
              'setid10': ['range10']};
    break;
    default:
      console.log("type should be PORTRAIT or LANDSCAPE")
    }
  const ranges = rangeMap[setid];  // Récupérer la valeur de range associée à setid
  return ranges || [];  // Si aucune valeur correspondante n'est trouvée, retourner un tableau vide
}


export function Generate_Digitalcard_DominionGames () {

  Generate_Digitalcard_DominionGames_for_set('Baseset')
  Generate_Digitalcard_DominionGames_for_set('Alchemy')
  Generate_Digitalcard_DominionGames_for_set('Seaside')
  Generate_Digitalcard_DominionGames_for_set('Cornucopia')
  Generate_Digitalcard_DominionGames_for_set('Prosperity')
  Generate_Digitalcard_DominionGames_for_set('Intrigue')
  Generate_Digitalcard_DominionGames_for_set('Guilds')
  Generate_Digitalcard_DominionGames_for_set('Hinterlands')
  Generate_Digitalcard_DominionGames_for_set('Darkages')
  Generate_Digitalcard_DominionGames_for_set('Adventures')
  Generate_Digitalcard_DominionGames_for_set('Empires')
  Generate_Digitalcard_DominionGames_for_set('Nocturne')
  Generate_Digitalcard_DominionGames_for_set('Renaissance')
  Generate_Digitalcard_DominionGames_for_set('Promo')
  Generate_Digitalcard_DominionGames_for_set('Menagerie')
  Generate_Digitalcard_DominionGames_for_set('Allies')
  Generate_Digitalcard_DominionGames_for_set('Plunder')
  Generate_Digitalcard_DominionGames_for_set('Guildscornucopia')
  Generate_Digitalcard_DominionGames_for_set('RisingSun')

}



