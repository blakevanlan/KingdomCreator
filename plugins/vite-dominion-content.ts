import fs from 'fs';
import path from 'path';

import { loadSets, loadKingdoms } from './DominionContent-LoadFunc';
import { mergeJSONLanguageFiles, Convert_to_CSV } from './DominionLocaleGeneration-Funcs'
import { Generate_Digitalcard } from './Dominion-Generate-Digital_cards'
import { Generate_Digitalcard_DominionGames } from './Dominion-Generate-Digital_cards-Dominiongames';
const ProjectBaseDir = process.cwd();

//  `DominionContentGeneration` is responsible for generating the Dominion content files.
export async function DominionContentGenerate(destdir:string) {

  const contentString = "window.DominionSets=" + JSON.stringify(loadSets()) + ";\n" +
    "\n" + "window.DominionKingdoms=" + JSON.stringify(loadKingdoms()) + ";\n";
  fs.writeFileSync(path.join(ProjectBaseDir, destdir + '/dominion-content.js'), 
    contentString, { encoding: 'utf8', flag: 'w', mode: 0o666 })
};

export function HandleLocaleGenerateAndMerge(type: string, destdir: string) {
  if (type == "Gen&Merge") {
    Generate_Digitalcard()
    //Generate_Digitalcard_DominionGames()
    Convert_to_CSV()
    mergeJSONLanguageFiles(destdir)
  }
  if (type =="Merge") {
    Convert_to_CSV()
    mergeJSONLanguageFiles(destdir)
  }
}