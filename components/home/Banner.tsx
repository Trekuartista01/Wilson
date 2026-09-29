import Image from "next/image";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import Container from "@/components/ui/Container";
import SearchBar from "@/components/properties/SearchBar";
import heroImage from "@/public/images/hero.jpg";

type BannerProps = {
  lang: Locale;
  dict: Dictionary;
};

/**
 * Homepage hero (Figma "Hero"): aerial coast photo with eyebrow, headline and two CTAs,
 * plus the property search bar straddling the bottom edge.
 * The photo sits behind the whole section and the search row paints white over its own
 * lower half, so the bar is half on the photo and half on the page at any bar height.
 */
export default function Banner({ lang, dict }: BannerProps) {
  const t = dict.home.banner;

  return (
    <section aria-labelledby="banner-title" className="relative isolate">
      <Image
        src={heroImage}
        alt=""
        fill
        priority
        placeholder="blur"
        sizes="100vw"
        className="-z-20 object-cover object-[center_40%]"
      />
      {/* Darkens the photo behind the text: even on phones (text runs full width),
          heavier on the left from sm up, where the text sits. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-black/50 sm:bg-transparent sm:bg-linear-to-r sm:from-black/70 sm:via-black/40 sm:to-black/10"
      />

      <div className="text-surface">
        <Container className="pt-12 pb-16 sm:pt-20 sm:pb-24 lg:pt-28 lg:pb-40">
          <p className="text-lg font-light sm:text-xl">{t.eyebrow}</p>
          <h1
            id="banner-title"
            className="mt-3 max-w-2xl text-[2rem] leading-tight font-semibold tracking-tight text-balance sm:text-5xl lg:max-w-3xl lg:text-6xl"
          >
            {t.title}
          </h1>
          <div className="mt-8 flex flex-col gap-3 sm:mt-12 sm:flex-row sm:gap-8">
            <Link
              href={localePath(lang, "/properties")}
              className="inline-flex min-h-12 items-center justify-center gap-2 bg-surface px-4 text-base text-ink transition-colors hover:bg-surface-subtle"
            >
              {t.primaryCta}
              <FiArrowRight aria-hidden />
            </Link>
            <Link
              href={localePath(lang, "/contact")}
              className="inline-flex min-h-12 items-center justify-center gap-6 border border-surface px-4 text-base transition-colors hover:bg-surface/10"
            >
              {t.secondaryCta}
              <FiArrowRight aria-hidden />
            </Link>
          </div>
        </Container>
      </div>

      {/* Search bar: top half over the photo, bottom half over the white page. */}
      <div className="bg-[linear-gradient(to_bottom,transparent_50%,var(--color-surface)_50%)]">
        <Container>
          <div className="mx-auto max-w-5xl">
            <SearchBar lang={lang} dict={dict} />
          </div>
        </Container>
      </div>
    </section>
  );
}
