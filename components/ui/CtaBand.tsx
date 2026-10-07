import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Reveal from "@/components/ui/Reveal";

type CtaBandProps = {
  lang: Locale;
  dict: Dictionary;
  /** "yellow" (gold): homepage, Services and About. "brown": the older style, unused for now. */
  variant?: "brown" | "yellow";
  /** Colour of the section above, shown behind the band's rounded top-right corner. */
  above?: "dark" | "cream";
};

/**
 * "Jeni në duar të sigurta!" call to action, the last band above the footer (homepage, About,
 * Services). The band rounds its top-right and bottom-left corners: the section behind it shows
 * the colour above in its top half and the footer black in its bottom half.
 */
export default function CtaBand({
  lang,
  dict,
  variant = "brown",
  above = variant === "yellow" ? "dark" : "cream",
}: CtaBandProps) {
  const t = dict.home.cta;
  const yellow = variant === "yellow";

  return (
    <section
      className={`${
        above === "dark"
          ? "bg-[linear-gradient(to_bottom,var(--color-surface-dark)_50%,var(--color-brand-darker)_50%)]"
          : "bg-[linear-gradient(to_bottom,var(--color-surface-cream)_50%,var(--color-brand-darker)_50%)]"
      } ${yellow ? "text-ink" : "text-surface"}`}
    >
      <div
        className={`rounded-tr-band rounded-bl-band ${yellow ? "bg-brand-cta py-16 sm:py-20 lg:py-24" : "bg-brand-brown py-16 sm:py-20 lg:py-28"}`}
      >
        <Container>
          <Reveal>
            {yellow ? (
              <p className="text-xl sm:text-2xl lg:text-[1.75rem]">{t.eyebrow}</p>
            ) : (
              <Eyebrow className="text-surface">{t.eyebrow}</Eyebrow>
            )}
            <h2 className={`text-3xl leading-tight text-balance sm:text-4xl lg:text-5xl ${yellow ? "mt-2" : "mt-4"}`}>
              {t.title}
            </h2>
            <p
              className={`mt-6 max-w-4xl leading-snug ${yellow ? "text-lg sm:text-xl lg:mt-12 lg:text-[1.75rem]" : "text-lg sm:text-xl lg:text-[1.75rem]"}`}
            >
              {t.text}
            </p>
            <Link
              href={localePath(lang, "/properties")}
              className={`group mt-10 inline-flex min-h-14 items-center gap-3 rounded-tr-btn rounded-bl-btn bg-black px-6 text-lg transition-colors ${
                yellow
                  ? "text-surface hover:bg-surface hover:text-ink lg:mt-16"
                  : "text-gold-light hover:bg-brand-accent hover:text-ink lg:mt-20"
              }`}
            >
              {t.button}
              <FiArrowRight aria-hidden className="transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </Container>
      </div>
    </section>
  );
}
