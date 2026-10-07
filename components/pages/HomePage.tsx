import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import IntroAnimation from "@/components/home/IntroAnimation";
import Banner from "@/components/home/Banner";
import AboutUsOnHomePage from "@/components/home/AboutUsOnHomePage";
import FirstPart from "@/components/home/FirstPart";
import SecondPart from "@/components/home/SecondPart";
import ThirdPart from "@/components/home/ThirdPart";
import CtaBand from "@/components/ui/CtaBand";

type HomePageProps = {
  lang: Locale;
  dict: Dictionary;
};

/**
 * Homepage: stacked full-width sections in the order of the "Wilson Home Page" mockup
 * (2026-10-02), opened by the logo intro on the first visit of a browser session.
 */
export default function HomePage({ lang, dict }: HomePageProps) {
  const t = dict.home;
  return (
    <>
      <IntroAnimation />
      <Banner dict={dict} />
      <AboutUsOnHomePage lang={lang} dict={dict} />
      <FirstPart lang={lang} dict={dict} />
      <SecondPart lang={lang} dict={dict} />
      <ThirdPart
        eyebrow={t.why.eyebrow}
        lines={t.why.lines}
        paragraphs={[t.process.statement, t.cta.text]}
        learnMore={{ label: t.why.learnMore, href: localePath(lang, "/about") }}
        steps={t.process.steps}
        stepImageLabel={t.process.stepImage}
      />
      <CtaBand lang={lang} dict={dict} variant="yellow" />
    </>
  );
}
