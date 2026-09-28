import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import ArrowLink from "@/components/ui/ArrowLink";
import Container from "@/components/ui/Container";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";
import Reveal from "@/components/ui/Reveal";

/**
 * Condensed "About us" teaser linking to the full About page.
 * TODO: awaiting Figma. Neutral placeholder layout (image + text).
 */
export default function AboutUsOnHomePage({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const t = dict.home.about;

  return (
    <section className="py-14 sm:py-20 lg:py-24">
      <Container className="grid items-center gap-8 md:grid-cols-2 md:gap-12 lg:gap-20">
        <Reveal>
          <ImagePlaceholder aspect="aspect-[4/3]" label={dict.common.imagePlaceholder} />
        </Reveal>
        <Reveal delay={0.1}>
          <p className="text-base font-medium text-ink-muted">{t.eyebrow}</p>
          <h2 className="mt-2 text-3xl font-medium tracking-tight sm:text-4xl">{t.title}</h2>
          <p className="mt-4 max-w-md text-lg text-ink-muted">{t.text}</p>
          <ArrowLink href={localePath(lang, "/about")} className="mt-4">
            {t.cta}
          </ArrowLink>
        </Reveal>
      </Container>
    </section>
  );
}
