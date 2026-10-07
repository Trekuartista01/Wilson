// Search for the navbar search box and the properties page:
// - the keyword suggestions the navbar offers (each one opens the properties page with filters),
// - the free-text match behind /properties?q=..., which looks through a listing's titles, place
//   names and labels (type, status, standout feature, what is close by).
// Matching ignores case and accents ("Durres" finds "Durrës", "plazh" finds "Plazh").

import { locales, localePath, format, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import {
  amenities,
  areaRanges,
  priceRanges,
  propertyStatuses,
  propertyTypes,
  zones,
  getZone,
  type Property,
} from "@/data/properties";

/** Lowercase, no accents, single spaces: "Shëngjin, Lezhë" -> "shengjin, lezhe". */
export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

// Filler words in the three languages, ignored so "land near the beach" needs only "land" + "beach".
const STOPWORDS = new Set([
  "a", "an", "and", "by", "close", "for", "in", "near", "of", "or", "the", "to", "with", "property", "properties",
  "afer", "dhe", "e", "i", "me", "ne", "per", "prane", "prona", "prone", "te",
  "am", "bei", "das", "der", "die", "im", "mit", "nahe", "und", "zu", "immobilie", "immobilien",
]);

function tokens(query: string): string[] {
  return normalize(query)
    .split(/[^\p{L}\p{N}]+/u)
    .filter((t) => t && !STOPWORDS.has(t));
}

/** Every word of the query (fillers aside) must appear somewhere; "plots" also finds "plot". */
function matches(haystack: string, query: string): boolean {
  const words = tokens(query);
  if (!words.length) return true;
  return words.every((w) => haystack.includes(w) || (w.length > 3 && haystack.includes(w.replace(/(es|s)$/, ""))));
}

/** Free-text filter for /properties?q=. Labels come from the page's language; place names from all three. */
export function searchProperties(list: Property[], query: string | undefined, dict: Dictionary): Property[] {
  if (!query?.trim()) return list;
  return list.filter((p) => {
    const zone = getZone(p.zone);
    const haystack = normalize(
      [
        ...locales.map((l) => p.title[l]),
        p.description.sq,
        ...locales.map((l) => zone.name[l]),
        p.municipality,
        p.reference,
        dict.propertyTypes[p.type],
        dict.propertyStatus[p.status],
        dict.propertyFeatures[p.feature],
        ...p.nearby.map((a) => dict.amenities[a]),
      ].join(" "),
    );
    return matches(haystack, query);
  });
}

export type SearchSuggestion = {
  label: string;
  /** Group heading in the list ("Popular searches", "Zones", ...). */
  group: string;
  href: string;
  /** Extra words that should find it (the same thing in the other two languages). Normalized. */
  keywords: string;
};

/**
 * Everything the navbar search suggests, in `lang`: the curated popular searches first, then
 * one entry per zone, type, status, close-by amenity, price range and area range. Built on the
 * server (Header) and handed to the client navbar.
 */
export function buildSuggestions(lang: Locale, dicts: Record<Locale, Dictionary>): SearchSuggestion[] {
  const dict = dicts[lang];
  const t = dict.searchSuggestions;
  // Popular searches come from JSON with differing keys, so missing ones arrive as undefined.
  const href = (params: Record<string, string | undefined>) =>
    `${localePath(lang, "/properties")}?${new URLSearchParams(
      Object.entries(params).filter((e): e is [string, string] => typeof e[1] === "string"),
    ).toString()}`;
  const others = (pick: (d: Dictionary) => string) => normalize(locales.map((l) => pick(dicts[l])).join(" "));

  return [
    ...t.popular.map((p) => ({ label: p.label, group: t.groups.popular, href: href(p.params), keywords: normalize(p.keywords ?? "") })),
    ...zones.map((z) => ({
      label: format(t.inZone, { zone: z.name[lang] }),
      group: t.groups.zones,
      href: href({ zone: z.slug }),
      keywords: normalize(locales.map((l) => z.name[l]).join(" ")),
    })),
    ...propertyTypes.map((v) => ({
      label: dict.propertyTypes[v],
      group: t.groups.types,
      href: href({ type: v }),
      keywords: others((d) => d.propertyTypes[v]),
    })),
    ...propertyStatuses.map((v) => ({
      label: dict.propertyStatus[v],
      group: t.groups.types,
      href: href({ status: v }),
      keywords: others((d) => d.propertyStatus[v]),
    })),
    ...amenities.map((v) => ({
      label: format(t.near, { place: dict.amenities[v] }),
      group: t.groups.nearby,
      href: href({ near: v }),
      keywords: `${others((d) => d.amenities[v])} ${normalize(t.amenityKeywords[v] ?? "")}`,
    })),
    ...priceRanges.map((v) => ({
      label: dict.search.priceRanges[v],
      group: t.groups.budget,
      href: href({ price: v }),
      keywords: others((d) => d.search.price),
    })),
    ...areaRanges.map((v) => ({
      label: dict.search.areaRanges[v],
      group: t.groups.budget,
      href: href({ area: v }),
      keywords: others((d) => d.search.area),
    })),
  ];
}

/** The suggestions that fit what has been typed so far (all words, any order, accents ignored). */
export function filterSuggestions(list: SearchSuggestion[], query: string, limit = 8): SearchSuggestion[] {
  if (!tokens(query).length) return list.filter((s, i) => i < limit && s.group === list[0]?.group);
  return list.filter((s) => matches(`${normalize(s.label)} ${s.keywords}`, query)).slice(0, limit);
}
