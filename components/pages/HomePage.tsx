import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import Banner from "@/components/home/Banner";
import FirstPart from "@/components/home/FirstPart";
import AboutUsOnHomePage from "@/components/home/AboutUsOnHomePage";
import SecondPart from "@/components/home/SecondPart";
import ThirdPart from "@/components/home/ThirdPart";
import FourthPart from "@/components/home/FourthPart";
import CtaBand from "@/components/ui/CtaBand";

type HomePageProps = {
  lang: Locale;
  dict: Dictionary;
};

/** Homepage: stacked full-width sections in the order of the "Wilson - Home Page" mockup. */
export default function HomePage({ lang, dict }: HomePageProps) {
  return (
    <>
      <Banner lang={lang} dict={dict} />
      <FirstPart lang={lang} dict={dict} />
      <AboutUsOnHomePage lang={lang} dict={dict} />
      <SecondPart lang={lang} dict={dict} />
      <ThirdPart lang={lang} dict={dict} />
      <FourthPart
        statement={dict.home.process.statement}
        steps={dict.home.process.steps}
        stepImageLabel={dict.home.process.stepImage}
      />
      <CtaBand lang={lang} dict={dict} />
    </>
  );
}
