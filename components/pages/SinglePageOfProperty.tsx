import { FiArrowRight } from "react-icons/fi";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { getZone, type NearbyPlace, type Property } from "@/data/properties";
import { formatArea, formatDistance, formatPrice } from "@/lib/format";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import Map from "@/components/map/Map";
import PropertyCard from "@/components/properties/PropertyCard";
import PropertyFacts from "@/components/properties/PropertyFacts";
import PropertyGallery from "@/components/properties/PropertyGallery";

type SinglePageOfPropertyProps = {
  property: Property;
  /** "Prona të ngjashme", picked by the route from the published listings. */
  similar: Property[];
  lang: Locale;
  dict: Dictionary;
};

/**
 * Property detail page ("Prona Detaje" mockup), opened from a listing card or a map pin:
 * full-screen photo hero under the transparent navbar, then a band with a satellite map and the
 * key facts (three at a time), the "Location" section (what is close by and how far, a map,
 * "Open in Google Maps"), then similar properties. No contact card or description (removed
 * by request); "Kontakto Wilson" in the facts band opens the Contact page.
 */
export default function SinglePageOfProperty({ property, similar, lang, dict }: SinglePageOfPropertyProps) {
  const t = dict.property;
  const zoneName = getZone(property.zone).name[lang];
  const typeName = dict.propertyTypes[property.type];
  const statusName = dict.propertyStatus[property.status];
  const area = formatArea(lang, property.areaSqm);
  const price = property.price === null ? dict.common.priceOnRequest : formatPrice(lang, property.price);

  // Three per page in the facts band: what the mockup shows first, then the screenshot's three.
  const facts = [
    { label: t.propertyId, value: property.reference },
    { label: t.area, value: area },
    { label: t.feature, value: dict.propertyFeatures[property.feature] },
    { label: t.status, value: statusName },
    { label: t.type, value: typeName },
    { label: t.municipality, value: property.municipality },
  ];

  const marker = {
    id: property.slug,
    lat: property.lat,
    lng: property.lng,
    title: property.title[lang],
    subtitle: `${area} · ${price}`,
  };
  // Close-by places looked up on OpenStreetMap: listed with their names, and dots on the map
  // (except the airport and town, usually far outside the map's view).
  const places = property.nearbyPlaces;
  const placeName = (p: NearbyPlace) => p.names?.[lang] ?? p.name;
  const placeMarkers = places
    .filter((p) => p.amenity !== "airport" && p.amenity !== "cityCentre")
    .map((p) => ({
      id: `place-${p.amenity}`,
      lat: p.lat,
      lng: p.lng,
      title: placeName(p) ?? dict.amenities[p.amenity],
      subtitle: `${dict.amenities[p.amenity]} · ${formatDistance(lang, p.metres)}`,
      variant: "place" as const,
    }));
  const googleMaps = `https://www.google.com/maps/search/?api=1&query=${property.lat},${property.lng}`;

  return (
    <div>
      <PropertyGallery
        images={property.images}
        title={property.title[lang]}
        meta={`${zoneName} · ${property.municipality} · ${statusName}`}
        heading={[zoneName, `${typeName} ${area}`]}
        labels={{
          gallery: t.gallery,
          previous: t.previous,
          next: t.next,
          photo: t.photo,
        }}
      />

      <PropertyFacts
        facts={facts}
        marker={marker}
        contactHref={localePath(lang, "/contact")}
        labels={{
          previous: t.detailsPrevious,
          next: t.detailsNext,
          page: t.detailsPage,
          contact: t.contact,
          mapLabel: `${t.satelliteLabel}: ${property.title[lang]}`,
          mapLoading: dict.map.loading,
        }}
      />

      {/* Location: what is close by, with distances, next to a working map. */}
      <section aria-labelledby="location-title" className="bg-surface-dark py-16 text-surface sm:py-20 lg:py-24">
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,8fr)] lg:gap-16 xl:px-20">
          <Reveal className="flex flex-col">
            <p className="flex items-center gap-2 text-xs tracking-[0.14em] uppercase sm:text-sm">
              <span aria-hidden className="size-1.5 rounded-full bg-brand-accent" />
              {t.location}
            </p>
            <h2 id="location-title" className="mt-5 text-3xl leading-[1.1] uppercase sm:text-4xl lg:text-[2.6rem]">
              {t.locationTitle}
            </h2>

            {places.length > 0 ? (
              <>
                <dl className="mt-10 border-t border-surface/10 lg:mt-14">
                  {places.map((place) => (
                    <div
                      key={place.amenity}
                      className="flex min-h-16 items-center justify-between gap-4 border-b border-surface/10 py-3"
                    >
                      <dt className="min-w-0">
                        <span className="block text-surface/85">{dict.amenities[place.amenity]}</span>
                        {placeName(place) && (
                          <span className="block truncate text-sm text-surface/50">{placeName(place)}</span>
                        )}
                      </dt>
                      <dd className="shrink-0 text-xl text-brand-accent tabular-nums">
                        {formatDistance(lang, place.metres)}
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-3 text-xs text-surface/45">{t.nearbySource}</p>
              </>
            ) : (
              property.nearby.length > 0 && (
                // Before the OpenStreetMap lookup has run: the places ticked in the admin.
                <dl className="mt-10 border-t border-surface/10 lg:mt-14">
                  {property.nearby.map((place) => {
                    const metres = property.nearbyDistances[place];
                    return (
                      <div
                        key={place}
                        className="flex min-h-16 items-center justify-between gap-4 border-b border-surface/10 py-3"
                      >
                        <dt className="text-surface/85">{dict.amenities[place]}</dt>
                        <dd className="shrink-0 text-xl text-brand-accent tabular-nums">
                          {metres ? formatDistance(lang, metres) : <span className="sr-only">{dict.search.near}</span>}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              )
            )}

            <a
              href={googleMaps}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-10 inline-flex min-h-12 items-center gap-6 self-start rounded-tr-btn rounded-bl-btn border border-surface/70 px-6 text-sm transition-colors hover:bg-surface hover:text-ink"
            >
              {t.openInMaps}
              <FiArrowRight aria-hidden className="transition-transform group-hover:translate-x-1" />
            </a>
          </Reveal>

          <Map
            label={`${t.location}: ${property.title[lang]}`}
            loadingLabel={dict.map.loading}
            markers={[marker, ...placeMarkers]}
            zoom={13}
            tiles="dark"
            openPopup
            className="h-80 rounded-tr-card rounded-bl-card bg-surface/5 sm:h-[26rem] lg:h-full lg:min-h-[30rem]"
          />
        </Container>
      </section>

      {similar.length > 0 && (
        <Container className="pt-14 pb-16 sm:pt-16 sm:pb-20 lg:pt-24 lg:pb-28">
          <section>
            <h2 className="font-sans text-xl font-medium sm:text-2xl">{t.similar}</h2>
            <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10 xl:gap-16">
              {similar.map((p, i) => (
                <Reveal as="li" key={p.slug} delay={i * 0.08}>
                  <PropertyCard property={p} lang={lang} dict={dict} />
                </Reveal>
              ))}
            </ul>
          </section>
        </Container>
      )}
    </div>
  );
}
