import fs from 'fs';
import path from 'path';

import { loadSets, loadKingdoms } from './DominionContent-LoadFunc';
import { mergeJSONLanguageFiles, Convert_to_CSV } from './DominionLocaleGeneration-Funcs'

const ProjectBaseDir = process.cwd();

//  `DominionContentGeneration` is responsible for generating the Dominion content files.
export async function DominionContentGenerate(destdir:string) {
  //console.log('in DominionContentGenerate generating docs/dominion-content.js')
  const contentString = "window.DominionSets=" + JSON.stringify(loadSets()) +
    ";window.DominionKingdoms=" + JSON.stringify(loadKingdoms()) + ";";
  fs.writeFileSync(path.join(ProjectBaseDir, destdir + '/dominion-content.js'), 
    contentString, { encoding: 'utf8', flag: 'w', mode: 0o666 })
};

export function HandleLocaleGenerateAndMerge(type: string, destdir: string) {
  if (type == "Gen&Merge") {
    Convert_to_CSV()
    mergeJSONLanguageFiles(destdir)
  }
  if (type =="Merge") {
    mergeJSONLanguageFiles(destdir)
  }
}