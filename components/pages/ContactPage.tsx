import { FiArrowUpRight } from "react-icons/fi";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { offices } from "@/lib/offices";
import { siteConfig } from "@/lib/site";
import ContactForm from "@/components/contact/ContactForm";
import OfficeMap from "@/components/contact/OfficeMap";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";

type ContactPageProps = {
  lang: Locale;
  dict: Dictionary;
  /** Published listings for the form's "Property" select. */
  properties: { slug: string; label: string }[];
};

/**
 * Contact page ("04-contact" mockup, 2026-10-06). Hero on near-black under the transparent
 * navbar: "Let's talk land." and the intro on the left, the form on the right with underlined
 * fields and a white Submit (the "image.png" reference, on black by request).
 * Then "Prefer something faster?" (call, WhatsApp, visit a plot) and the offices on a dark map
 * (switchable between Tiranë, Prishtinë and Tale).
 */
export default function ContactPage({ lang, dict, properties }: ContactPageProps) {
  const t = dict.contactPage;
  const whatsapp = `https://wa.me/${siteConfig.whatsapp}`;

  const faster = [
    {
      ...t.faster.call,
      action: siteConfig.phone,
      href: siteConfig.phoneHref,
      external: false,
      tone: "bg-surface-sand text-ink",
    },
    { ...t.faster.whatsapp, href: whatsapp, external: true, tone: "bg-brand-cta text-ink" },
    { ...t.faster.visit, href: "#contact-form", external: false, tone: "bg-surface-dark text-surface" },
  ];

  return (
    <>
      {/* Hero: runs up behind the sticky header ([data-hero], see Navbar). */}
      <section
        aria-labelledby="contact-title"
        data-hero
        className="relative -mt-(--header-h) overflow-hidden rounded-tr-band rounded-bl-band bg-surface-dark pt-(--header-h) text-surface"
      >
        <Container className="grid gap-14 py-14 sm:py-20 lg:grid-cols-2 lg:gap-0 lg:py-24">
          <Reveal className="lg:pr-16 xl:pr-24">
            <p className="flex items-center gap-2 text-sm tracking-[0.14em] uppercase">
              <span aria-hidden className="size-1.5 rounded-full bg-brand-cta" />
              {t.eyebrow}
            </p>
            <h1
              id="contact-title"
              className="mt-6 text-[3rem] leading-[0.95] tracking-tight uppercase sm:text-[4.5rem] lg:text-[5.25rem] xl:text-[6rem]"
            >
              {t.title}
            </h1>
            <p className="mt-8 max-w-md leading-relaxed text-surface/80 sm:text-lg lg:mt-12">{t.intro}</p>
          </Reveal>

          <Reveal delay={0.1} as="section" className="lg:pt-14 lg:pl-16 xl:pl-24">
            {/* Anchor for "Book a viewing"; the heading is for screen readers (the reference shows none). */}
            <h2 id="contact-form" className="sr-only scroll-mt-[calc(var(--header-h)+1.5rem)]">
              {t.formTitle}
            </h2>
            <div>
              <ContactForm lang={lang} labels={t.form} properties={properties} />
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Quicker ways to get in touch. */}
      <section aria-labelledby="faster-title" className="py-16 sm:py-20 lg:py-28">
        <Container>
          <Reveal>
            <h2 id="faster-title" className="font-sans text-3xl tracking-tight sm:text-4xl lg:text-[2.75rem]">
              {t.fasterTitle}
            </h2>
          </Reveal>
          <ul className="mt-10 grid gap-4 sm:grid-cols-3 sm:gap-5 lg:mt-12">
            {faster.map((card, i) => (
              <Reveal as="li" key={card.title} delay={i * 0.08}>
                <a
                  href={card.href}
                  {...(card.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className={`group flex h-full min-h-60 flex-col rounded-tr-card rounded-bl-card p-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink lg:p-8 ${card.tone}`}
                >
                  <span className={`text-xs tabular-nums ${i === 2 ? "text-brand-cta" : "opacity-60"}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="mt-auto pt-10 text-2xl sm:text-[1.75rem]">{card.title}</span>
                  <span className="mt-1 text-sm opacity-70">{card.text}</span>
                  <span className="mt-6 flex items-center justify-between gap-4 text-sm">
                    {card.action}
                    <span
                      aria-hidden
                      className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-surface text-ink transition-transform group-hover:rotate-45"
                    >
                      <FiArrowUpRight className="size-4" />
                    </span>
                  </span>
                </a>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      {/* The offices on a dark map, with a switch and the address card on top. */}
      <OfficeMap
        offices={offices.map((o, i) => ({ ...o, ...dict.aboutPage.offices[i] }))}
        brand={siteConfig.name}
        t={t.office}
        mapLabel={t.mapLabel}
        loadingLabel={dict.map.loading}
      />
    </>
  );
}
