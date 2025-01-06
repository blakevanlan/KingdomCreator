import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';
import { spawnSync } from 'child_process';

const languages = ['fr', 'de', 'es', 'nl', 'pl', 'it']; // Liste des langues à fusionner
const ProjectBaseDir = process.cwd();
const languageSourceDir = 'src/i18n/locales'
const languageDestDir = '/locales'

// for function Convert_to_CSV
const MessagesFileDir = 'process/resources'
const XLSXMessagesFileName = 'Pages.xlsx'
const CSVMessagesFileName = 'Pages.csv'
const LocaleResultDir = 'process/processed/src'

// Fonction pour convertir le fichier xlsx de messages traduit en CSV
export function Convert_to_CSV () {
  console.log("Starting CSV conversion")
  const inputfile = path.join(MessagesFileDir, XLSXMessagesFileName)
  const outputfile = path.join(MessagesFileDir, CSVMessagesFileName)
  XLSX.set_fs(fs);
  const workbook = XLSX.readFile(inputfile);
  const worksheet = workbook.Sheets[Object.keys(workbook.Sheets)[0]]; // Prendre la première feuille de calcul
  const csvLines = XLSX.utils.sheet_to_csv(worksheet,
                    {FS:"\t"}).split('\n');
  const firstRowCells: string[] = csvLines[0].split('\t',2); // Split the first row into cells
  csvLines[0] = firstRowCells.join('\t'); // Reconstruct the modified first row
  fs.writeFileSync(outputfile, csvLines.join('\n'), 'utf8');
  Build_Translation();
}

function Build_Translation() {
  console.log("Start building translation")
  if (fs.existsSync(LocaleResultDir)) {
    fs.rmSync(LocaleResultDir, { recursive: true })
  }
  const buildProcess = spawnSync('node', ['Build-translation-pages.js', '..'], { cwd: 'process' } );
  console.log(`${ buildProcess.stdout}`)
  console.log(`${ buildProcess.stderr}`)
}

function copyDirectory(sourcePath: string, destPath: string): void {
  const files = fs.readdirSync(sourcePath);
  for (const file of files) {
    const filePath = path.join(sourcePath, file);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      copyDirectory(filePath, path.join(destPath, file));
    } else {
      fs.copyFileSync(filePath, path.join(destPath, file));
    }
  }
}

// Fonction pour merger des JSON dans un seul fichier JSON
export function mergeJSONLanguageFiles(destdir:string) {
  console.log("Merging locale Messages")
  for (const lang of languages) {
    // Chemins vers les répertoires contenant les fichiers JSON à fusionner
    const messagesDir = path.join(ProjectBaseDir, languageSourceDir, 'messages', lang);
    const cardsDir = path.join(ProjectBaseDir, languageSourceDir, 'messages', lang, 'cards');
    //console.log(messagesDir)

    // Chemin vers le fichier de sortie
    const outputFile = path.join(ProjectBaseDir, destdir, languageDestDir, `${lang}.json`);
    testExistAndCreateDir(path.join(ProjectBaseDir, destdir, languageDestDir));

    // Fusionne tous les fichiers JSON dans le répertoire messagesDir
    const messagesFiles = fs.readdirSync(messagesDir)
      .filter(file => file.includes(`.${lang}.`) && file.endsWith('.json'))
      .map(file => path.join(messagesDir, file));
    //console.log(messagesFiles)
    const messages = messagesFiles.reduce((result, file) => {
      const data = readJsonFile(file);
      return { ...result, ...data };
    }, {});
    // Fusionne tous les fichiers JSON dans le répertoire cardsDir
    let cards
    if (fs.existsSync(cardsDir)) {
      const cardsFiles = fs.readdirSync(cardsDir)
        .filter(file => file.includes(`.${lang}.`) && file.endsWith('.json'))
        .map(file => path.join(cardsDir, file));

      cards = cardsFiles.reduce((result, file) => {
        const data = readJsonFile(file);
        return { ...result, ...data };
      }, {});
    }
    // Fusionne les données et écrit le fichier de sortie
    const mergedData = { ...messages, ...cards };
    //console.log(outputFile)

    writeJsonFile(outputFile, mergedData);
  }
}

// Fonction pour créer une struture de répertoire si elle n'existe pas
function testExistAndCreateDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Fonction pour lire le contenu d'un fichier JSON
function readJsonFile(filePath: string): any {
  const fileContents = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContents);
}

// Fonction pour écrire le contenu d'un objet dans un fichier JSON
function writeJsonFile(filePath: string, data: any) {
  const json = JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, json, 'utf8');
}
