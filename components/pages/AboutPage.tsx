import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import Container from "@/components/ui/Container";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";
import PageBanner from "@/components/ui/PageBanner";
import Reveal from "@/components/ui/Reveal";

/**
 * About Wilson page: story, how we work (reuses the six process steps), offices.
 * TODO: awaiting Figma. Neutral placeholder layout.
 */
export default function AboutPage({ dict }: { lang: Locale; dict: Dictionary }) {
  const t = dict.aboutPage;

  return (
    <>
      <PageBanner eyebrow={t.eyebrow} title={t.title} intro={t.intro} />

      <Container className="grid items-center gap-8 py-12 sm:py-16 md:grid-cols-2 md:gap-12 lg:gap-20 lg:py-24">
        <Reveal>
          <ImagePlaceholder aspect="aspect-[4/3]" label={dict.common.imagePlaceholder} />
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="text-3xl font-medium tracking-tight sm:text-4xl">{t.storyTitle}</h2>
          <p className="mt-4 max-w-md text-lg text-ink-muted">{t.storyText}</p>
        </Reveal>
      </Container>

      <section className="bg-surface-subtle py-12 sm:py-16 lg:py-24">
        <Container>
          <h2 className="text-3xl font-medium tracking-tight sm:text-4xl">{t.valuesTitle}</h2>
          <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
            {dict.home.process.steps.map((step, i) => (
              <Reveal as="li" key={step.title} delay={(i % 3) * 0.08} className="flex gap-4">
                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-primary font-semibold text-surface">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <p className="mt-1 text-ink-muted">{step.text}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </Container>
      </section>

      <Container className="py-12 sm:py-16 lg:py-24">
        <h2 className="text-3xl font-medium tracking-tight sm:text-4xl">{t.officesTitle}</h2>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {t.offices.map((office, i) => (
            <Reveal as="li" key={office.name} delay={i * 0.08}>
              <ImagePlaceholder aspect="aspect-[3/2]" label={dict.common.imagePlaceholder} />
              <h3 className="mt-4 text-xl font-medium">{office.name}</h3>
              <p className="mt-1 text-ink-muted">{office.text}</p>
            </Reveal>
          ))}
        </ul>
      </Container>
    </>
  );
}
