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
 * Homepage hero ("Wilson - Home Page" mockup): full-bleed aerial photo that runs up behind the
 * transparent header, yellow eyebrow, display headline, one text link, and the frosted search
 * bar at the bottom. The photo stops 1.5rem short of the section's bottom, so the bar hangs
 * slightly over the cream section below.
 */
export default function Banner({ lang, dict }: BannerProps) {
  const t = dict.home.banner;

  return (
    <section
      aria-labelledby="banner-title"
      data-hero
      className="relative isolate -mt-(--header-h) flex min-h-[36rem] flex-col justify-end bg-surface-cream sm:min-h-[40rem] lg:min-h-[max(44rem,min(100svh,56rem))]"
    >
      <div className="absolute inset-x-0 top-0 bottom-6 -z-10 overflow-hidden">
        <Image
          src={heroImage}
          alt=""
          fill
          priority
          placeholder="blur"
          sizes="100vw"
          className="object-cover object-[center_40%]"
        />
        {/* Even tint so the white nav and headline read on the bright sky and sea;
            a bit heavier on phones, where the text runs full width. */}
        <div aria-hidden className="absolute inset-0 bg-black/35 sm:bg-linear-to-r sm:from-black/35 sm:via-black/15 sm:to-black/5" />
      </div>

      <Container className="pt-[calc(var(--header-h)+3rem)] pb-10 text-surface sm:pb-16 lg:pb-24">
        <p className="text-lg text-brand-accent sm:text-2xl">{t.eyebrow}</p>
        <h1
          id="banner-title"
          className="mt-2 max-w-[36rem] text-[1.9rem] leading-[1.1] text-balance sm:text-5xl lg:max-w-[48rem] lg:text-[3.25rem]"
        >
          {t.title}
        </h1>
        <Link
          href={localePath(lang, "/properties")}
          className="group mt-6 inline-flex min-h-11 items-center gap-3 text-lg text-gold-light sm:mt-10 sm:text-xl"
        >
          <span className="underline-offset-4 group-hover:underline">{t.cta}</span>
          <FiArrowRight aria-hidden className="transition-transform group-hover:translate-x-1" />
        </Link>
      </Container>

      <Container>
        <div className="mx-auto max-w-[43rem]">
          <SearchBar lang={lang} dict={dict} variant="hero" />
        </div>
      </Container>
    </section>
  );
}
