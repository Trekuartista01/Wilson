import { intlLocales, type Locale } from "@/i18n/config";

export function formatPrice(locale: Locale, price: number): string {
  return new Intl.NumberFormat(intlLocales[locale], {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatArea(locale: Locale, sqm: number): string {
  return `${new Intl.NumberFormat(intlLocales[locale]).format(sqm)} m²`;
}

/** Land area in ares (1 ar = 100 m²), e.g. 8400 -> "84". */
export function formatAres(locale: Locale, sqm: number): string {
  return new Intl.NumberFormat(intlLocales[locale], { maximumFractionDigits: 1 }).format(sqm / 100);
}

/** ISO date -> "4 maj 2026" / "4 May 2026" / "4. Mai 2026". */
export function formatDate(locale: Locale, isoDate: string): string {
  return new Intl.DateTimeFormat(intlLocales[locale], { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(isoDate),
  );
}
