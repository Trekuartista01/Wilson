import { locales, type Locale } from "@/i18n/config";
import { getDictionary, type Dictionary } from "@/i18n/dictionaries";
import { buildSuggestions } from "@/lib/property-search";
import Navbar from "./Navbar";

type HeaderProps = {
  lang: Locale;
  dict: Dictionary;
};

/**
 * Shared site header. Server wrapper that passes the nav strings and the search suggestions
 * to the client Navbar. The suggestions carry the other two languages' words as keywords, so
 * "plazh" also finds "Beach" on the English site.
 */
export default async function Header({ lang, dict }: HeaderProps) {
  const entries = await Promise.all(locales.map(async (l) => [l, await getDictionary(l)] as const));
  const dicts = Object.fromEntries(entries) as Record<Locale, Dictionary>;
  return <Navbar lang={lang} labels={dict.nav} suggestions={buildSuggestions(lang, dicts)} />;
}
