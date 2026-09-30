import Image from "next/image";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import ArrowLink from "@/components/ui/ArrowLink";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Reveal from "@/components/ui/Reveal";
import { serviceImages } from "@/components/services/service-images";

/**
 * Homepage section 3: "Shërbimet Wilson" band with four service tiles. Hovering (or focusing)
 * a tile darkens the photo's edges and slides in "Mëso më shumë" at the bottom; on touch
 * screens, which have no hover, that line is always shown.
 */
export default function ThirdPart({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const t = dict.home.services;

  return (
    <section className="bg-surface-card py-14 sm:py-20 lg:py-24">
      <Container>
        <div className="grid gap-6 md:grid-cols-2 md:gap-10 lg:px-12">
          <Reveal>
            <Eyebrow>{t.eyebrow}</Eyebrow>
            <h2 className="mt-3 max-w-xs text-4xl leading-tight font-medium tracking-tight sm:text-5xl">{t.title}</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-sm text-lg text-ink-muted">{t.text}</p>
            <ArrowLink href={localePath(lang, "/services")} className="mt-4">
              {t.viewAll}
            </ArrowLink>
          </Reveal>
        </div>

        <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4 lg:gap-8">
          {dict.services.map((service, i) => (
            <Reveal as="li" key={service.slug} delay={i * 0.08}>
              <Link
                href={`${localePath(lang, "/services")}#${service.slug}`}
                className="group relative flex aspect-[4/3] items-start justify-center overflow-hidden bg-brand-secondary p-5 text-center text-lg font-medium text-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary sm:aspect-[4/5]"
              >
                {serviceImages[service.slug] && (
                  <>
                    {/* Decorative: the link text names the service. */}
                    <Image
                      src={serviceImages[service.slug]}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      placeholder="blur"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    />
                    <span aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/10 to-transparent" />
                  </>
                )}
                {/* Hover: edges darken (vignette), which also keeps the bottom line readable. */}
                <span
                  aria-hidden
                  className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.6)_100%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none [@media(hover:none)]:opacity-100"
                />
                <span className="relative">{service.title}</span>
                <span className="absolute inset-x-0 bottom-5 flex translate-y-2 items-center justify-center gap-2 text-base font-normal opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 motion-reduce:transition-none [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100">
                  {dict.servicesPage.learnMore}
                  <FiArrowRight aria-hidden />
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
