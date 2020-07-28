import { DeepReadonly } from "@/DeepReadonly";

export const LANGUAGE_LIST: DeepReadonly<string[]> = ["en", "ja", "fr", "de"];

const STORAGE_LANGUAGE_KEY = "StorageLanguageKey";

function loadNavigatorLanguage(): string {
  return window.navigator.language.slice(0, 2);
}

function loadStorageLanguage(): string | null {
  return window.localStorage.getItem(STORAGE_LANGUAGE_KEY);
}

export function loadLanguage(): string {
  const storageLang = loadStorageLanguage();
  if (storageLang != null) return storageLang;

  const navigatorLang = loadNavigatorLanguage();
  if (LANGUAGE_LIST.includes(navigatorLang)) {
    return navigatorLang;
  } else {
    return LANGUAGE_LIST[0];
  }
}

export function saveLanguage(lang: string) {
  if (LANGUAGE_LIST.includes(lang)) {
    window.localStorage.setItem(STORAGE_LANGUAGE_KEY, lang);
  } else {
    throw new Error("wrong lang code.");
  }
}
