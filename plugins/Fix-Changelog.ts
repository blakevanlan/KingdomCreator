import fs from 'fs';
import path from 'path';

export function fixChangelogSpaces() {
  const changelogPath = path.resolve(import.meta.dirname, '../Changelog.md');
  if (!fs.existsSync(changelogPath)) return;
  console.log('\x1b[33m%s\x1b[0m', '⚠️  Vérification du fichier Changelog.md pour les espaces manquants...');

  const content = fs.readFileSync(changelogPath, 'utf8');
  const updatedContent = content.replace(/^(>\*\*\*(?:Fix|Feat)\*\*\* - .*?)[ \t]*$/gm, '$1  ');
  if (content !== updatedContent) {
    fs.writeFileSync(changelogPath, updatedContent, 'utf8');
    console.log('\x1b[32m%s\x1b[0m', '✓ Changelog.md mis à jour.');
  }
}