import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { getZone, type Property } from "@/data/properties";
import { formatArea, formatPrice } from "@/lib/format";
import Card from "@/components/ui/Card";

type PropertyCardProps = {
  property: Property;
  lang: Locale;
  dict: Dictionary;
  headingLevel?: "h2" | "h3";
};

export default function PropertyCard({ property, lang, dict, headingLevel }: PropertyCardProps) {
  const price = property.price === null ? dict.common.priceOnRequest : formatPrice(lang, property.price);
  return (
    <Card
      href={localePath(lang, `/properties/${property.slug}`)}
      headline={property.title[lang]}
      subhead={`${getZone(property.zone).name[lang]} · ${price}`}
      body={property.description[lang]}
      tagsTitle={dict.common.details}
      tags={[
        formatArea(lang, property.areaSqm),
        dict.propertyTypes[property.type],
        dict.propertyStatus[property.status],
      ]}
      buttonLabel={dict.common.view}
      imageLabel={dict.common.imagePlaceholder}
      imageUrl={property.images[0]?.url}
      headingLevel={headingLevel}
    />
  );
}
