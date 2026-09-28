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
