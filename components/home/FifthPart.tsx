import Link from "next/link";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import ArrowLink from "@/components/ui/ArrowLink";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";

/** Homepage section 5: "Shërbimet Wilson" band with four service tiles (Figma "Scroll", bottom). */
export default function FifthPart({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const t = dict.home.services;

  return (
    <section className="bg-surface-muted py-14 sm:py-20 lg:py-24">
      <Container>
        <div className="grid gap-6 md:grid-cols-2 md:gap-10 lg:px-12">
          <Reveal>
            <p className="text-base font-medium">{t.eyebrow}</p>
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
              {/* TODO: brand imagery. Gray tile stands in for the service photo. */}
              <Link
                href={`${localePath(lang, "/services")}#${service.slug}`}
                className="flex aspect-[4/3] items-start justify-center bg-brand-secondary p-5 text-center text-lg font-medium transition-colors hover:bg-brand-accent hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary sm:aspect-[4/5]"
              >
                {service.title}
              </Link>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
