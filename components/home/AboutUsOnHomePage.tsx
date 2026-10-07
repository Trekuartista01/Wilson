import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import ScrollWords from "@/components/ui/ScrollWords";
import WipeReveal from "@/components/ui/WipeReveal";
import StatCards from "@/components/ui/StatCards";
import { markPaths } from "@/components/home/intro-logo";

/**
 * Condensed "About Wilson" teaser ("Wilson Home Page" mockup): eyebrow on top, then the photo
 * and the statement side by side, tops aligned, the statement filling in word by word as it
 * scrolls up (ScrollWords, fast). Then a row of three stat cards, the middle one yellow, whose
 * numbers count up as they come in. The photo wipes in from the bottom. The first card links to the listings; the
 * full story lives on the About page ("Learn more" in the Why Wilson section).
 */
export default function AboutUsOnHomePage({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const t = dict.home.about;

  return (
    <section aria-labelledby="about-home-title" className="bg-surface-cream py-16 sm:py-24 lg:py-28">
      <Container className="xl:px-30">
        <Reveal>
          <h2 id="about-home-title" className="font-sans text-lg tracking-wide uppercase">
            {t.eyebrow}
          </h2>
        </Reveal>
        <div className="mt-8 grid items-start gap-8 md:mt-12 md:grid-cols-[minmax(0,0.55fr)_minmax(0,1fr)] md:gap-12 lg:gap-24">
          {/* The W mark from the logo, in black (final mockup). Decorative: the statement carries the content. */}
          <WipeReveal from="left" className="w-40 sm:w-52 lg:w-64">
            <svg aria-hidden viewBox="8 8 870 314" className="block h-auto w-full fill-ink">
              {markPaths.map((d) => (
                <path key={d} d={d} />
              ))}
            </svg>
          </WipeReveal>
          {/* Negative margin: lines the cap height of the first line up with the mark's top edge. */}
          <ScrollWords
            as="p"
            speed="fast"
            text={t.statement}
            className="-mt-[0.22em] text-[1.6rem] leading-[1.3] tracking-tight sm:text-[2rem] lg:text-[2.4rem] xl:max-w-[50rem]"
          />
        </div>

        <StatCards
          stats={t.stats}
          href={localePath(lang, "/properties")}
          linkLabel={t.statsLink}
          className="mt-12 border-t border-ink/10 pt-12 lg:mt-14 lg:pt-14"
        />
      </Container>
    </section>
  );
}
