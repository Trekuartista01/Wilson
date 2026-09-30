import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Reveal from "@/components/ui/Reveal";

/** "Jeni në duar të sigurta!" call to action, the last band above the footer (homepage, Services). */
export default function CtaBand({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const t = dict.home.cta;

  return (
    <section className="bg-brand-brown py-16 text-surface sm:py-20 lg:py-28">
      <Container>
        <Reveal>
          <Eyebrow className="text-surface">{t.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-3xl leading-tight text-balance sm:text-4xl lg:text-5xl">{t.title}</h2>
          <p className="mt-6 max-w-4xl text-lg leading-snug sm:text-xl lg:text-[1.75rem]">{t.text}</p>
          <Link
            href={localePath(lang, "/properties")}
            className="group mt-10 inline-flex min-h-14 items-center gap-3 rounded bg-black px-6 text-lg text-gold-light transition-colors hover:bg-brand-accent hover:text-ink lg:mt-20"
          >
            {t.button}
            <FiArrowRight aria-hidden className="transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </Container>
    </section>
  );
}
