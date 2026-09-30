import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { areaRanges, propertyStatuses, propertyTypes, zones, type PropertyFilters } from "@/data/properties";
import SearchForm, { type SearchField } from "@/components/properties/SearchForm";

type SearchBarProps = {
  lang: Locale;
  dict: Dictionary;
  defaults?: PropertyFilters;
  variant?: "default" | "hero";
  className?: string;
};

/**
 * Property search (Zona / Lloji / Sipërfaqja / Statusi / Kërko).
 * Builds the translated options here on the server and hands only those to the client form,
 * which sends the visitor to the filtered properties list.
 */
export default function SearchBar({ lang, dict, defaults = {}, variant, className }: SearchBarProps) {
  const t = dict.search;

  const fields: SearchField[] = [
    {
      name: "zone",
      label: t.zone,
      placeholder: t.all,
      options: zones.map((z) => ({ value: z.slug, label: z.name[lang] })),
    },
    {
      name: "type",
      label: t.type,
      placeholder: t.all,
      options: propertyTypes.map((v) => ({ value: v, label: dict.propertyTypes[v] })),
    },
    {
      name: "area",
      label: t.area,
      placeholder: t.anyArea,
      options: areaRanges.map((v) => ({ value: v, label: t.areaRanges[v] })),
    },
    {
      name: "status",
      label: t.status,
      placeholder: t.all,
      options: propertyStatuses.map((v) => ({ value: v, label: dict.propertyStatus[v] })),
    },
  ];

  return (
    <SearchForm
      action={localePath(lang, "/properties")}
      fields={fields}
      values={defaults}
      submitLabel={t.submit}
      ariaLabel={t.label}
      variant={variant}
      className={className}
    />
  );
}
