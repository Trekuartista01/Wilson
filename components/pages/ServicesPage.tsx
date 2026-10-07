import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import Container from "@/components/ui/Container";
import CtaBand from "@/components/ui/CtaBand";
import Eyebrow from "@/components/ui/Eyebrow";
import Reveal from "@/components/ui/Reveal";
import ServiceStack from "@/components/services/ServiceStack";
import { serviceImages } from "@/components/services/service-images";

/**
 * Services page ("Sherbimet" mockup, 2026-10-06): cream intro, then the four services as
 * full-screen coloured bands that stack as you scroll (ServiceStack), and the yellow
 * "Jeni në duar të sigurta!" band above the footer.
 */
export default function ServicesPage({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const t = dict.servicesPage;

  return (
    <>
      <Container className="pt-14 pb-10 sm:pt-20 sm:pb-12 lg:pt-24 lg:pb-14 xl:px-30">
        <Reveal className="border-b border-divider pb-8 sm:pb-10">
          <Eyebrow className="text-brand-accent">{t.eyebrow}</Eyebrow>
          <h1 className="mt-4 font-sans text-4xl tracking-tight sm:mt-6 sm:text-5xl lg:text-[3.5rem]">{t.title}</h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-muted sm:text-2xl">{t.intro}</p>
        </Reveal>
      </Container>

      <ServiceStack
        services={dict.services.map((s) => ({ ...s, image: serviceImages[s.slug] }))}
        learnMore={{ label: t.learnMore, href: localePath(lang, "/contact") }}
        imageLabel={dict.common.imagePlaceholder}
      />

      <CtaBand lang={lang} dict={dict} variant="yellow" above="cream" />
    </>
  );
}
