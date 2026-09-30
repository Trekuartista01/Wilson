import { format, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { getZone, type Property } from "@/data/properties";
import { formatArea, formatAres, formatDate, formatPrice } from "@/lib/format";
import { siteConfig } from "@/lib/site";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import Map from "@/components/map/Map";
import PropertyCard from "@/components/properties/PropertyCard";
import PropertyGallery from "@/components/properties/PropertyGallery";
import PropertyInquiry from "@/components/properties/PropertyInquiry";

type SinglePageOfPropertyProps = {
  property: Property;
  /** "Prona të ngjashme", picked by the route from the published listings. */
  similar: Property[];
  lang: Locale;
  dict: Dictionary;
};

/**
 * Property detail page (Figma "Pronat Desc"), opened from a listing card or a map pin:
 * photo/map hero, title, key facts, description + details table + location map, contact
 * card (WhatsApp, phone, enquiry form), and similar properties.
 */
export default function SinglePageOfProperty({ property, similar, lang, dict }: SinglePageOfPropertyProps) {
  const t = dict.property;
  const zoneName = getZone(property.zone).name[lang];
  const typeName = dict.propertyTypes[property.type];
  const statusName = dict.propertyStatus[property.status];
  const area = formatArea(lang, property.areaSqm);
  const price = property.price === null ? dict.common.priceOnRequest : formatPrice(lang, property.price);

  const facts = [
    { label: t.area, value: area },
    { label: t.type, value: typeName },
    { label: t.zone, value: `${zoneName}, ${property.municipality}` },
    { label: t.feature, value: dict.propertyFeatures[property.feature] },
  ];

  // "ID e pronës" spans the top row, the other six fill 2 rows x 3 columns (2 columns on phones).
  const details = [
    { label: t.propertyId, value: property.reference },
    { label: t.landArea, value: `${area} (${format(t.ari, { count: formatAres(lang, property.areaSqm) })})` },
    { label: t.propertyType, value: typeName },
    { label: t.zone, value: zoneName },
    { label: t.status, value: statusName },
    { label: t.municipality, value: property.municipality },
    { label: t.updated, value: formatDate(lang, property.updatedAt) },
  ];

  const heading = `${zoneName} — ${typeName} ${area}`;
  const whatsappText = format(t.inquiry.whatsappText, { property: heading, ref: property.reference });

  const marker = { id: property.slug, lat: property.lat, lng: property.lng, title: property.title[lang], subtitle: zoneName };

  return (
    <div>
      <PropertyGallery
        images={property.images}
        title={property.title[lang]}
        marker={marker}
        labels={{
          gallery: t.gallery,
          showPhotos: t.showPhotos,
          showMap: t.showMap,
          previous: t.previous,
          next: t.next,
          photo: t.photo,
          mapLabel: `${t.location}: ${property.title[lang]}`,
          mapLoading: dict.map.loading,
        }}
      />

      <Container className="pt-8 pb-16 sm:pt-10 sm:pb-20 lg:pb-28">
        <p className="text-sm text-ink-muted">
          {zoneName} · {property.municipality} · {statusName}
        </p>
        <h1 className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-2xl font-medium tracking-tight text-brand-brown sm:gap-x-4 sm:text-3xl lg:text-4xl">
          <span>{zoneName}</span>
          <span aria-hidden className="h-px w-8 bg-brand-brown sm:w-12" />
          <span>
            {typeName} {area}
          </span>
        </h1>

        {/* Key facts: 2 x 2 on phones, one row with dividers from lg */}
        <Reveal className="mt-10 sm:mt-14 lg:mt-20">
          <dl className="grid grid-cols-2 gap-y-8 lg:grid-cols-4">
            {facts.map((fact) => (
              <div
                key={fact.label}
                className="min-w-0 border-divider px-4 odd:pl-0 even:border-l sm:px-6 lg:border-l lg:px-8 lg:first:border-l-0 lg:[&:nth-child(3)]:pl-8"
              >
                <dt className="text-xs tracking-wide uppercase sm:text-sm">{fact.label}</dt>
                <dd className="mt-2 text-lg font-semibold break-words sm:text-2xl">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <div className="mt-14 grid gap-12 sm:mt-16 lg:mt-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16 xl:grid-cols-[minmax(0,1fr)_minmax(0,29rem)]">
          <div className="min-w-0">
            <Reveal>
              <h2 className="font-sans text-xl font-medium">{t.description}</h2>
              <p className="mt-3 max-w-xl text-ink-muted">{property.description[lang]}</p>
            </Reveal>

            <Reveal className="mt-12">
              <h2 className="font-sans text-xl font-medium">{t.details}</h2>
              {/* Grid lines: the list's divider-coloured background shows through 1px gaps
                  between cream cells, so every column count gets clean inner and outer lines. */}
              <dl className="mt-5 grid grid-cols-2 gap-px border border-divider bg-divider text-center sm:grid-cols-3">
                {details.map((row, i) => (
                  <div key={row.label} className={`bg-surface-cream px-3 py-5 sm:px-4 ${i === 0 ? "col-span-2 sm:col-span-3" : ""}`}>
                    <dt className="text-sm font-medium">{row.label}</dt>
                    <dd className="mt-2 text-sm text-ink-muted">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            <Reveal className="mt-12 max-w-lg">
              <h2 className="font-sans text-xl font-medium">{t.location}</h2>
              <Map
                label={`${t.location}: ${property.title[lang]}`}
                loadingLabel={dict.map.loading}
                markers={[marker]}
                zoom={12}
                className="mt-5 h-56 sm:h-64"
              />
            </Reveal>
          </div>

          <aside className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:self-start">
            <PropertyInquiry
              lang={lang}
              labels={t.inquiry}
              company={siteConfig.name}
              slug={property.slug}
              reference={property.reference}
              priceLabel={t.price}
              price={price}
              defaultMessage={format(t.inquiry.messageDefault, { property: heading })}
              whatsappHref={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(whatsappText)}`}
              phoneHref={siteConfig.phoneHref}
            />
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="mt-20 sm:mt-24 lg:mt-32">
            <h2 className="font-sans text-xl font-medium sm:text-2xl">{t.similar}</h2>
            <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10 xl:gap-16">
              {similar.map((p, i) => (
                <Reveal as="li" key={p.slug} delay={i * 0.08}>
                  <PropertyCard property={p} lang={lang} dict={dict} />
                </Reveal>
              ))}
            </ul>
          </section>
        )}
      </Container>
    </div>
  );
}
