import fs from 'fs';
import path from 'path';
import { exit } from 'process';

export function CheckVersions_Package_Readme_Changelog() {
  const __dirname: string = path.resolve();
  const changelogPath: string = path.join(__dirname, 'Changelog.md');
  const readmePath: string = path.join(__dirname, 'README.md');
  const packageJsonPath: string = path.join(__dirname, 'package.json');

// Vérification de l'existence des fichiers
  if (!fs.existsSync(changelogPath) || !fs.existsSync(readmePath) || !fs.existsSync(packageJsonPath)) {
    console.error('⚠️ Fichiers de version (package.json, Changelog.md ou README.md) introuvables.');
    return;
  }

  // 2. EXTRACTION DES VERSIONS
  // Version du package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const packageVersion: string | undefined = packageJson.version;

  // Versions du Changelog et du README via la Regex
  const regex: RegExp = /^##{1,2} Changelog\s*\n\s*\*\*\d{4}\/\d{2}\/\d{2} - (\d+\.\d+\.\d+)/m;

  const changelogText: string = fs.readFileSync(changelogPath, 'utf-8');
  const changelogVersionMatch: RegExpMatchArray | null = changelogText.match(regex);
  const changelogVersion: string | null = changelogVersionMatch ? changelogVersionMatch[1] : null;

  const readmeText: string = fs.readFileSync(readmePath, 'utf-8');
  const readmeVersionMatch: RegExpMatchArray | null = readmeText.match(regex);
  const readmeVersion: string | null = readmeVersionMatch ? readmeVersionMatch[1] : null;

  console.log(`[Versions] \n   Package:   ${packageVersion} \n   Changelog: ${changelogVersion} \n   Readme:    ${readmeVersion}`);

  // 3. VÉRIFICATION DE LA SYNCHRONISATION
  if (packageVersion !== changelogVersion || changelogVersion !== readmeVersion) {
    console.error("\x1b[31m%s\x1b[0m", "❌ Inconsistency in version numbers. Please Check.");
    exit(0);
  }
}