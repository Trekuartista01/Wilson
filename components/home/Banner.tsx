import type { Dictionary } from "@/i18n/dictionaries";
import Container from "@/components/ui/Container";
import HeroVideo from "./HeroVideo";

type BannerProps = {
  dict: Dictionary;
};

/**
 * Homepage hero ("Wilson Home Page" mockup, 2026-10-02): full-screen video running up behind
 * the transparent header, and the slogan at the bottom left ("Përtej tokës" / "Beyond Land",
 * 2026-10-07): Gilmer, white in regular weight with the land word bold in brand gold.
 * `twoLines` puts that word on its own line (German, "Jenseits des / Landes"). The video and headline take part in the intro animation
 * (data-intro-zoom / data-intro-fade, see IntroAnimation.tsx).
 */
export default function Banner({ dict }: BannerProps) {
  const t = dict.home.banner;

  return (
    <section
      aria-labelledby="banner-title"
      data-hero
      className="relative isolate -mt-(--header-h) flex min-h-[34rem] flex-col justify-end overflow-hidden rounded-tr-band rounded-bl-band bg-surface-dark h-svh max-h-[70rem]"
    >
      <div data-intro-zoom className="absolute inset-0 -z-10">
        <HeroVideo />
        {/* Darker at the top for the navbar and at the bottom for the headline. */}
        <div aria-hidden className="absolute inset-0 bg-linear-to-b from-black/45 via-black/10 via-35% to-black/70" />
      </div>

      <Container className="pb-16 text-surface sm:pb-20 lg:pb-28">
        <h1
          id="banner-title"
          data-intro-fade
          style={{ "--intro-delay": "700ms" } as React.CSSProperties}
          className="font-sans text-[1.75rem] leading-[1.08] font-normal tracking-[0.06em] uppercase sm:text-[2.6rem] lg:pl-4 lg:text-[2.9rem] 2xl:text-[3.6rem]"
        >
          {t.lead} <span className={`font-bold text-brand-accent ${t.twoLines ? "block" : ""}`}>{t.highlight}</span>
        </h1>
      </Container>
    </section>
  );
}
