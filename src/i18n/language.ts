export enum Language {
  DUTCH = "nl",
  ENGLISH = "en",
  FRENCH = "fr",
  GERMAN = "de",
  SPANISH = "es",
  POLISH ="pl",
  ITALIAN = "it"
}

export const defaultLanguage = Language.ENGLISH;

export function getLanguage(value: string) :Language {
  const [prefix] = value.split("-");
  for (const key of Object.keys(Language)) {
    if (Language[key as keyof typeof Language] == prefix) {
      return Language[key as keyof typeof Language];
    }
  }
  return defaultLanguage;
}
