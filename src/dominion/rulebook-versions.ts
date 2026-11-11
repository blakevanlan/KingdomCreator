import { load } from 'js-yaml';
import { Language } from '@/i18n/language';
import rulebooksYaml from './rulebooks.yaml?raw';

export interface RulebookVersion {
  year: number;
  url: string;
}

interface RulebookVersionList {
  language: string;
  versions: RulebookVersion[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isRulebookVersion(value: unknown): value is RulebookVersion {
  return isRecord(value)
    && typeof value.year === 'number'
    && Number.isInteger(value.year)
    && typeof value.url === 'string'
    && /^https?:\/\//.test(value.url);
}

const parsedCatalog: unknown = load(rulebooksYaml);
const catalog = isRecord(parsedCatalog) && isRecord(parsedCatalog.rulebooks)
  ? parsedCatalog.rulebooks
  : {};

const setIdAliases: Record<string, string> = {
  baseset2: 'baseset',
  intrigue2: 'intrigue',
  seaside2: 'seaside',
  prosperity2: 'prosperity',
  hinterlands2: 'hinterlands',
  guildscornucopia2: 'guildscornucopia',
};

function getVersions(setId: string, language: string): RulebookVersion[] {
  const resolvedSetId = setIdAliases[setId] ?? setId;
  const setCatalog = catalog[setId] ?? catalog[resolvedSetId];
  if (!isRecord(setCatalog)) return [];

  const versions = setCatalog[language];
  return Array.isArray(versions) ? versions.filter(isRulebookVersion) : [];
}

export function hasRulebookVersions(setId: string, language: string): boolean {
  const setCatalog = catalog[setId];
  if (!isRecord(setCatalog)) return false;

  const versions = setCatalog[language];
  return Array.isArray(versions) && versions.some(isRulebookVersion);
}

export function getRulebookVersions(setId: string, language: string): RulebookVersionList {
  const versions = getVersions(setId, language);
  if (versions.length > 0) {
    return { language, versions: [...versions].sort((a, b) => a.year - b.year) };
  }

  return {
    language: Language.ENGLISH,
    versions: getVersions(setId, Language.ENGLISH).sort((a, b) => a.year - b.year),
  };
}
