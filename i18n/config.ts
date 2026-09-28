// Locale config shared by the proxy, server components and client components.
// Safe to import anywhere (no server-only code here).

export const locales = ["sq", "en", "de"] as const;
export type Locale = (typeof locales)[number];

// Albanian is the default because the Figma copy and the client's market are Albanian.
export const defaultLocale: Locale = "sq";

// Short labels shown in the language switcher. Figma uses "AL" for Albanian.
export const localeLabels: Record<Locale, string> = {
  sq: "AL",
  en: "EN",
  de: "DE",
};

export const localeNames: Record<Locale, string> = {
  sq: "Shqip",
  en: "English",
  de: "Deutsch",
};

// BCP 47 tags used for Intl number/currency formatting.
export const intlLocales: Record<Locale, string> = {
  sq: "sq-AL",
  en: "en-GB",
  de: "de-DE",
};

export const LOCALE_COOKIE = "NEXT_LOCALE";

export function hasLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Builds a locale-prefixed path, e.g. localePath("en", "/properties") -> "/en/properties". */
export function localePath(locale: Locale, path = "/"): string {
  const clean = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${clean}`;
}

/** Replaces {name} placeholders in a translated string. */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
