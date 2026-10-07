import type { Dictionary } from "@/i18n/dictionaries";
import Container from "@/components/ui/Container";
import HeroVideo from "./HeroVideo";

type BannerProps = {
  dict: Dictionary;
};

/**
 * Homepage hero ("Wilson Home Page" mockup, 2026-10-02): full-screen video running up behind
 * the transparent header, and the three-line display headline at the bottom left, the middle
 * line larger and in brand yellow. The video and headline take part in the intro animation
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
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-b from-black/45 via-black/10 via-35% to-black/70"
        />
      </div>

      <Container className="pb-16 text-surface sm:pb-20 lg:pb-28">
        <h1
          id="banner-title"
          data-intro-fade
          style={{ "--intro-delay": "700ms" } as React.CSSProperties}
          className="text-[1.75rem] leading-[1.08] uppercase sm:text-[2.6rem] lg:pl-4 lg:text-[2.9rem] 2xl:text-[3.6rem]"
        >
          {t.lines.map((line, i) => (
            <span key={line}>
              <span className={`block ${i === t.highlight ? "text-[1.25em] leading-[1.05] text-brand-accent" : ""}`}>
                {line}
              </span>{" "}
            </span>
          ))}
        </h1>
      </Container>
    </section>
  );
}
