import Image from "next/image";
import Link from "next/link";
import { format, localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { getZone, type Property } from "@/data/properties";
import { formatArea, formatAres } from "@/lib/format";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";

type FeaturedPropertyCardProps = {
  property: Property;
  lang: Locale;
  dict: Dictionary;
  /** The large card on the left of the homepage row. */
  large?: boolean;
};

/**
 * Homepage "Pronat e veçanta" card: borderless photo, then location, title and a fact row
 * (area, ares, type / status, reference). The whole card is one link.
 */
export default function FeaturedPropertyCard({ property, lang, dict, large = false }: FeaturedPropertyCardProps) {
  const aspect = large ? "aspect-[4/3]" : "aspect-[16/9]";
  const image = property.images[0];

  return (
    <Link
      href={localePath(lang, `/properties/${property.slug}`)}
      className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary"
    >
      {image ? (
        <div className={`relative overflow-hidden bg-placeholder ${aspect}`}>
          {/* Decorative: the title below names the listing. */}
          <Image
            src={image.url}
            alt=""
            fill
            sizes={large ? "(min-width: 1024px) 55vw, 100vw" : "(min-width: 1024px) 40vw, (min-width: 640px) 50vw, 100vw"}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        </div>
      ) : (
        <ImagePlaceholder aspect={aspect} label={dict.common.imagePlaceholder} />
      )}

      <div>
        <p className="mt-3 text-sm text-ink-muted">
          {getZone(property.zone).name[lang]}, {property.municipality}
        </p>
        <h3 className="mt-1 font-sans text-lg text-brand-brown underline-offset-4 group-hover:underline sm:text-xl">{property.title[lang]}</h3>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-6 gap-y-1">
          <span className="text-lg text-brand-brown sm:text-xl">{formatArea(lang, property.areaSqm)}</span>
          <span className="text-sm text-ink-muted">
            {format(dict.property.ari, { count: formatAres(lang, property.areaSqm) })}
          </span>
          <span className="text-sm text-ink-muted">
            {dict.propertyTypes[property.type]} / {dict.propertyStatus[property.status]}
          </span>
          <span className="ml-auto text-xs">{property.reference}</span>
        </div>
      </div>
    </Link>
  );
}
