import Image from "next/image";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import ArrowLink from "@/components/ui/ArrowLink";
import Container from "@/components/ui/Container";
import CtaBand from "@/components/ui/CtaBand";
import Eyebrow from "@/components/ui/Eyebrow";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";
import Reveal from "@/components/ui/Reveal";
import { serviceImages } from "@/components/services/service-images";

/**
 * Services page ("Sherbimet" mockup): cream intro, then one row per service (number, title,
 * text and link on the left, photo on the right) between thin dividers, and the
 * "Jeni në duar të sigurta!" band above the footer.
 */
export default function ServicesPage({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const t = dict.servicesPage;

  return (
    <>
      <Container className="pt-14 sm:pt-20 lg:pt-28">
        <Reveal className="border-b border-divider pb-8 sm:pb-10">
          <Eyebrow>{t.eyebrow}</Eyebrow>
          <h1 className="mt-4 font-sans text-4xl tracking-tight sm:mt-6 sm:text-5xl lg:text-[3.5rem]">{t.title}</h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-muted sm:text-2xl">{t.intro}</p>
        </Reveal>

        <ul className="pb-16 sm:pb-24 lg:pb-32">
          {dict.services.map((service, i) => (
            <li key={service.slug} id={service.slug} className="scroll-mt-6 border-b border-divider">
              <Reveal className="grid items-center gap-8 py-10 sm:py-14 md:grid-cols-2 md:gap-12 lg:py-16">
                <div className="flex gap-6 sm:gap-10 lg:pl-14">
                  <p className="w-8 shrink-0 pt-7 text-2xl text-brand-brown tabular-nums sm:w-10 sm:text-[1.75rem]">0{i + 1}</p>
                  <div>
                    <h2 className="font-sans text-xl sm:text-2xl">{service.title}</h2>
                    <p className="mt-2 max-w-md text-ink-muted">{service.text}</p>
                    {/* No per-service pages yet, so "learn more" leads to the contact form. */}
                    <ArrowLink href={localePath(lang, "/contact")} className="mt-4 font-normal text-brand-brown">
                      {t.learnMore}
                    </ArrowLink>
                  </div>
                </div>
                {serviceImages[service.slug] ? (
                  <div className="relative aspect-[3/2] overflow-hidden bg-placeholder">
                    {/* Decorative: the heading beside it names the service. */}
                    <Image
                      src={serviceImages[service.slug]}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 50vw, 100vw"
                      placeholder="blur"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <ImagePlaceholder aspect="aspect-[3/2]" label={dict.common.imagePlaceholder} />
                )}
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>

      <CtaBand lang={lang} dict={dict} />
    </>
  );
}
