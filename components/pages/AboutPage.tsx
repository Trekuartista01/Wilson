import Image from "next/image";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import Container from "@/components/ui/Container";
import CtaBand from "@/components/ui/CtaBand";
import Eyebrow from "@/components/ui/Eyebrow";
import Reveal from "@/components/ui/Reveal";
import StatCards from "@/components/ui/StatCards";
import WipeReveal from "@/components/ui/WipeReveal";
import { offices } from "@/lib/offices";
import { aboutWideImage, officeImages, storyImage } from "@/components/about/about-images";
import OfficeList from "@/components/about/OfficeList";

/**
 * About Wilson page ("Rreth Wilson1" mockup, 2026-10-06): photo banner with the title under the
 * transparent navbar, "Wilson Real Estate" with its intro and the three stat cards, the "direct
 * owner" strength on a dark band with a photo, mission and vision as two cards, the offices,
 * then the shared call to action. Bands, cards, photos and buttons round the top-right and
 * bottom-left corners, like the homepage.
 */
export default function AboutPage({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const t = dict.aboutPage;
  const properties = localePath(lang, "/properties");

  return (
    <>
      {/* Banner: runs up behind the sticky header ([data-hero], see Navbar); dark tint so the
          white title reads on any photo. */}
      <section
        aria-labelledby="about-title"
        data-hero
        className="relative isolate -mt-(--header-h) flex min-h-[27rem] items-end overflow-hidden rounded-tr-band rounded-bl-band bg-nav-dark sm:min-h-[32rem] lg:min-h-[40rem]"
      >
        <Image src={storyImage} alt="" fill priority placeholder="blur" sizes="100vw" className="-z-20 object-cover" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-b from-black/50 via-black/30 to-black/60" />
        <Container className="pt-(--header-h) pb-10 text-surface sm:pb-12 lg:pb-16">
          <Eyebrow className="text-surface">{t.eyebrow}</Eyebrow>
          <h1 id="about-title" className="mt-4 font-sans text-4xl tracking-tight sm:text-5xl lg:text-[3.5rem]">
            {t.title}
          </h1>
        </Container>
      </section>

      {/* "Wilson Real Estate" + intro, divider, stat cards. */}
      <Container className="py-14 sm:py-20 lg:py-24 xl:px-30">
        <Reveal className="grid gap-6 md:grid-cols-2 md:gap-12">
          <div>
            <Eyebrow className="text-brand-accent">{t.eyebrow}</Eyebrow>
            <h2 className="mt-5 font-sans text-3xl font-bold tracking-tight uppercase sm:text-4xl lg:text-[2.75rem]">
              {t.introTitle}
            </h2>
          </div>
          <p className="max-w-2xl text-lg leading-relaxed text-ink sm:text-xl md:pt-12 lg:pt-14 lg:text-[1.4rem]">
            {t.intro}
          </p>
        </Reveal>
        <StatCards
          stats={dict.home.about.stats}
          href={properties}
          linkLabel={dict.home.about.statsLink}
          className="mt-14 border-t border-ink/10 pt-6 sm:mt-16 lg:mt-20"
        />
      </Container>

      {/* Key strength: photo left, text right, on a dark band. */}
      <section className="rounded-tr-band rounded-bl-band bg-nav-dark py-12 text-surface sm:py-16 lg:py-20">
        <Container className="grid items-center gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-12 lg:gap-24">
          <WipeReveal from="left" className="w-full rounded-tr-card rounded-bl-card md:max-w-[32rem]">
            <div className="relative aspect-[4/3] bg-placeholder md:aspect-[507/547]">
              <Image
                src={aboutWideImage}
                alt=""
                fill
                placeholder="blur"
                sizes="(min-width: 768px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
          </WipeReveal>
          <Reveal delay={0.1}>
            <Eyebrow className="text-brand-accent">{t.strengthEyebrow}</Eyebrow>
            <h2 className="mt-6 max-w-sm font-sans text-2xl leading-tight font-semibold tracking-tight sm:text-[1.75rem]">
              {t.strengthTitle}
            </h2>
            <p className="mt-6 max-w-xl leading-relaxed text-surface/70 sm:text-lg">{t.strengthText}</p>
            <Link
              href={properties}
              className="group mt-8 inline-flex min-h-11 items-center gap-3 text-sm tracking-wide text-brand-accent uppercase transition-colors hover:text-surface"
            >
              {t.strengthLink}
              <FiArrowRight aria-hidden className="size-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </Container>
      </section>

      {/* Mission & vision: a sand card and a dark one, then a yellow rule. */}
      <section className="pt-16 sm:pt-20 lg:pt-24">
        <Container>
          <Reveal>
            <Eyebrow className="text-ink">{t.missionEyebrow}</Eyebrow>
          </Reveal>
          <div className="mt-8 grid gap-5 md:grid-cols-2 md:gap-10 lg:mt-12 lg:gap-x-[15%]">
            {[
              { label: t.missionTitle, title: t.missionHeading, text: t.missionText, dark: false },
              { label: t.visionTitle, title: t.visionHeading, text: t.visionText, dark: true },
            ].map((item, i) => (
              <Reveal
                key={item.label}
                delay={i * 0.1}
                className={`rounded-tr-card rounded-bl-card p-7 sm:p-9 ${item.dark ? "bg-nav-dark text-surface" : "bg-surface-mission"}`}
              >
                <p className="text-sm tracking-wide text-brand-accent uppercase">{item.label}</p>
                <h3 className="mt-4 max-w-sm font-sans text-lg leading-snug font-semibold sm:text-xl">{item.title}</h3>
                <p className={`mt-5 max-w-md text-sm leading-relaxed ${item.dark ? "text-surface/80" : "text-ink/80"}`}>
                  {item.text}
                </p>
              </Reveal>
            ))}
          </div>
          <div aria-hidden className="mt-16 h-px bg-brand-accent/50 sm:mt-20 lg:mt-28" />
        </Container>
      </section>

      {/* Offices: photo switches with the hovered/tapped office, like the homepage zones. */}
      <section className="py-14 sm:py-20 lg:py-24">
        <Container>
          <Reveal>
            <OfficeList
              offices={t.offices.map((office, i) => ({ ...office, image: officeImages[i], mapUrl: offices[i].mapUrl }))}
              mapLabel={dict.property.openInMaps}
              header={<Eyebrow>{t.officesTitle}</Eyebrow>}
            />
          </Reveal>
        </Container>
      </section>

      <CtaBand lang={lang} dict={dict} variant="yellow" above="cream" />
    </>
  );
}
