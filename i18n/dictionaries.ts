import "server-only";
import type { Locale } from "./config";
import type en from "./dictionaries/en.json";

export type Dictionary = typeof en;

// Typing each loader as Promise<Dictionary> makes the build fail if sq.json or de.json
// is missing a key that en.json has.
const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("./dictionaries/en.json").then((m) => m.default),
  sq: () => import("./dictionaries/sq.json").then((m) => m.default),
  de: () => import("./dictionaries/de.json").then((m) => m.default),
};

export const getDictionary = async (locale: Locale): Promise<Dictionary> => dictionaries[locale]();
