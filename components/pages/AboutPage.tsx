import Image from "next/image";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import Container from "@/components/ui/Container";
import CtaBand from "@/components/ui/CtaBand";
import Eyebrow from "@/components/ui/Eyebrow";
import Reveal from "@/components/ui/Reveal";
import { aboutWideImage, officeImages, storyImage } from "@/components/about/about-images";
import OfficeList from "@/components/about/OfficeList";

/**
 * About Wilson page ("Rreth Wilson" mockup): photo banner with the title, the philosophy
 * statement and the four-step approach on cream, the "direct owner" strength on white, a
 * full-width photo, mission and vision on slate, the offices, then the shared call to action.
 * The navbar keeps its normal solid style here (the mockup draws it over the photo).
 */
export default function AboutPage({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const t = dict.aboutPage;

  return (
    <>
      {/* Banner: photo with a dark tint so the white title reads on any image. */}
      <section aria-labelledby="about-title" className="relative isolate flex min-h-72 items-end sm:min-h-80 lg:min-h-96">
        <Image src={storyImage} alt="" fill priority placeholder="blur" sizes="100vw" className="-z-20 object-cover" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-black/45" />
        <Container className="pt-16 pb-10 text-surface sm:pb-12 lg:pb-14">
          <Eyebrow className="text-surface">{t.eyebrow}</Eyebrow>
          <h1 id="about-title" className="mt-4 font-sans text-4xl tracking-tight sm:text-5xl lg:text-[3.5rem]">
            {t.title}
          </h1>
        </Container>
      </section>

      {/* Philosophy statement + intro, divider, then "Qasja jonë" in four numbered steps. */}
      <Container className="py-14 sm:py-20 lg:py-24">
        <Reveal className="grid gap-6 border-b border-divider pb-14 sm:pb-16 md:grid-cols-2 md:gap-12 lg:pb-14">
          <p className="max-w-xs text-2xl leading-snug text-brand-brown sm:text-[1.75rem]">{dict.home.process.statement}</p>
          <p className="max-w-xl text-ink-muted sm:text-lg">{t.intro}</p>
        </Reveal>

        <Reveal className="mt-14 sm:mt-20">
          <Eyebrow>{t.approachTitle}</Eyebrow>
          <ol className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 sm:mt-12 lg:grid-cols-4">
            {t.approach.map((step, i) => (
              <li key={step}>
                <span className="text-2xl text-brand-brown tabular-nums sm:text-[1.75rem]">0{i + 1}</span>
                <p className="mt-3 text-lg">{step}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </Container>

      {/* Key strength */}
      <section className="bg-surface py-14 sm:py-20">
        <Container className="grid gap-4 md:grid-cols-[1fr_2fr] md:gap-12">
          <Reveal>
            <Eyebrow>{t.strengthEyebrow}</Eyebrow>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="max-w-sm font-sans text-2xl leading-tight font-bold tracking-tight text-brand-brown sm:text-[1.75rem]">
              {t.strengthTitle}
            </h2>
            <p className="mt-6 max-w-xl text-ink-muted sm:text-lg">{t.strengthText}</p>
          </Reveal>
        </Container>
      </section>

      {/* Full-width photo. Decorative. */}
      <div className="relative h-64 sm:h-80 lg:h-[30rem]">
        <Image src={aboutWideImage} alt="" fill placeholder="blur" sizes="100vw" className="object-cover" />
      </div>

      {/* Mission & vision */}
      <section className="bg-brand-slate py-16 text-surface sm:py-20 lg:py-24">
        <Container>
          <Eyebrow className="text-gold-dark lg:px-5">{t.missionEyebrow}</Eyebrow>
          <div className="mt-10 grid gap-10 md:grid-cols-2 md:gap-12 lg:mt-14">
            {[
              { title: t.missionTitle, text: t.missionText },
              { title: t.visionTitle, text: t.visionText },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 0.1} className="border-l border-gold-dark/80 pl-6 sm:pl-8 lg:ml-5">
                <h2 className="font-sans text-2xl sm:text-[1.75rem]">{item.title}</h2>
                <p className="mt-6 max-w-md leading-relaxed text-surface/70 sm:text-lg">{item.text}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Offices: photo switches with the hovered/tapped office, like the homepage zones. */}
      <section className="py-14 sm:py-20 lg:py-24">
        <Container>
          <Reveal>
            <OfficeList
              offices={t.offices.map((office, i) => ({ ...office, image: officeImages[i] }))}
              header={<Eyebrow>{t.officesTitle}</Eyebrow>}
            />
          </Reveal>
        </Container>
      </section>

      <CtaBand lang={lang} dict={dict} />
    </>
  );
}
