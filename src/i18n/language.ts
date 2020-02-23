export enum Language {
  DUTCH = "nl",
  ENGLISH = "en",
  GERMAN = "de",
}

export function getLanguage(value: string) {
  const [prefix] = value.split("-");
  for (let key of Object.keys(Language)) {
    if (Language[key as keyof typeof Language] == prefix) {
      return Language[key as keyof typeof Language];
    }
  }
  return Language.ENGLISH;
}