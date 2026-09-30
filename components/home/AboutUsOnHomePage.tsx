import Image from "next/image";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Reveal from "@/components/ui/Reveal";
import { storyImage } from "@/components/about/about-images";

/**
 * Condensed "Rreth Wilson" teaser linking to the full About page: text on the left,
 * large photo on the right, on a slate band between the cream sections. Photo: about-images.ts.
 */
export default function AboutUsOnHomePage({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const t = dict.home.about;

  return (
    <section className="bg-brand-slate py-4 text-surface sm:py-5">
      <Container className="grid items-center gap-10 py-10 md:grid-cols-[1fr_1.35fr] md:gap-12 md:py-0 lg:gap-16">
        <Reveal className="md:py-16">
          <Eyebrow className="text-brand-accent">{t.eyebrow}</Eyebrow>
          <h2 className="mt-4 max-w-md font-sans text-3xl leading-[1.1] font-bold tracking-tight sm:text-4xl lg:text-[2.6rem]">
            {t.title}
          </h2>
          <p className="mt-6 max-w-sm text-surface/75 sm:text-lg">{t.text}</p>
          <Link
            href={localePath(lang, "/about")}
            className="group mt-8 flex min-h-12 max-w-lg items-center gap-3 border-b border-brand-accent/30 text-lg text-brand-accent transition-colors hover:border-brand-accent"
          >
            {t.cta}
            <FiArrowRight aria-hidden className="transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="relative aspect-[4/3] overflow-hidden bg-placeholder md:aspect-[7/6]">
            {/* Decorative: the text beside it carries the content. */}
            <Image src={storyImage} alt="" fill sizes="(min-width: 768px) 55vw, 100vw" placeholder="blur" className="object-cover" />
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
