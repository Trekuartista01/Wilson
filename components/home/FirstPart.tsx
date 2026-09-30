import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { getPublishedProperties } from "@/lib/server/catalog";
import ArrowLink from "@/components/ui/ArrowLink";
import Eyebrow from "@/components/ui/Eyebrow";
import Reveal from "@/components/ui/Reveal";
import FeaturedPropertyCard from "@/components/properties/FeaturedPropertyCard";

/**
 * Homepage section 1: "Pronat e veçanta", three featured listings on cream.
 * Desktop: one large card on the left, two smaller ones stacked on the right.
 */
export default async function FirstPart({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const t = dict.home.featured;
  const featured = (await getPublishedProperties()).filter((p) => p.featured).slice(0, 3);
  if (!featured.length) return null;

  return (
    <section className="bg-surface-cream pt-16 pb-14 sm:pt-24 sm:pb-20 lg:pt-28 lg:pb-28">
      {/* Narrower, centred column (the site's earlier width) instead of the full-width 56px
          grid the other sections use: heading and cards together, so they stay aligned. */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10 2xl:max-w-[88rem]">
        <div className="mb-8 flex flex-col gap-2 sm:mb-12 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div>
            <Eyebrow>{t.eyebrow}</Eyebrow>
            <h2 className="mt-3 font-sans text-3xl tracking-tight sm:text-4xl">{t.title}</h2>
          </div>
          <ArrowLink href={localePath(lang, "/properties")} className="font-normal sm:text-lg">
            {t.viewAll}
          </ArrowLink>
        </div>

        <ul className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-[1.4fr_1fr] lg:gap-x-8 lg:gap-y-10">
          {featured.map((property, i) => (
            <Reveal
              as="li"
              key={property.slug}
              delay={i * 0.1}
              className={i === 0 ? "sm:col-span-2 lg:col-span-1 lg:row-span-2" : ""}
            >
              <FeaturedPropertyCard property={property} lang={lang} dict={dict} large={i === 0} />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
