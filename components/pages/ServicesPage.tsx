import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import Container from "@/components/ui/Container";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";
import PageBanner from "@/components/ui/PageBanner";
import Reveal from "@/components/ui/Reveal";

/**
 * Services page: one block per service, alternating image/text.
 * TODO: awaiting Figma. Neutral placeholder layout.
 */
export default function ServicesPage({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const t = dict.servicesPage;

  return (
    <>
      <PageBanner eyebrow={t.eyebrow} title={t.title} intro={t.intro} />

      <Container className="py-12 sm:py-16 lg:py-24">
        <div className="space-y-14 sm:space-y-20 lg:space-y-28">
          {dict.services.map((service, i) => (
            <Reveal key={service.slug}>
              <article id={service.slug} className="grid scroll-mt-6 items-center gap-6 md:grid-cols-2 md:gap-12 lg:gap-20">
                <ImagePlaceholder
                  aspect="aspect-[4/3]"
                  label={dict.common.imagePlaceholder}
                  className={i % 2 === 1 ? "md:order-2" : ""}
                />
                <div>
                  <p className="text-sm font-medium text-ink-muted">0{i + 1}</p>
                  <h2 className="mt-2 text-2xl font-medium tracking-tight sm:text-3xl">{service.title}</h2>
                  <p className="mt-4 max-w-md text-ink-muted">{service.text}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>

      <section className="bg-surface-muted py-12 sm:py-16">
        <Container className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-2xl font-medium">{dict.property.contactTitle}</p>
          <Link
            href={localePath(lang, "/contact")}
            className="inline-flex min-h-12 items-center gap-2 bg-brand-primary px-5 text-surface transition-colors hover:bg-black"
          >
            {t.cta}
            <FiArrowRight aria-hidden />
          </Link>
        </Container>
      </section>
    </>
  );
}
