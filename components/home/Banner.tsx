import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import Container from "@/components/ui/Container";
import SearchBar from "@/components/properties/SearchBar";

type BannerProps = {
  lang: Locale;
  dict: Dictionary;
};

/**
 * Homepage hero (Figma "Hero"): dark band with eyebrow, headline and two CTAs,
 * plus the property search bar straddling the bottom edge.
 * TODO: hero background image/video once brand assets exist.
 */
export default function Banner({ lang, dict }: BannerProps) {
  const t = dict.home.banner;

  return (
    <section aria-labelledby="banner-title">
      <div className="bg-brand-dark text-surface">
        <Container className="pt-12 pb-16 sm:pt-20 sm:pb-24 lg:pt-24 lg:pb-36">
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

      {/* Search bar sits half over the dark band and half over the white page. */}
      <div className="bg-[linear-gradient(to_bottom,var(--color-brand-dark)_50%,var(--color-surface)_50%)]">
        <Container>
          <div className="mx-auto max-w-5xl">
            <SearchBar lang={lang} dict={dict} />
          </div>
        </Container>
      </div>
    </section>
  );
}
