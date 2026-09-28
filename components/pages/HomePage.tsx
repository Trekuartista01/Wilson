import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import Banner from "@/components/home/Banner";
import FirstPart from "@/components/home/FirstPart";
import SecondPart from "@/components/home/SecondPart";
import ThirdPart from "@/components/home/ThirdPart";
import FourthPart from "@/components/home/FourthPart";
import FifthPart from "@/components/home/FifthPart";
import AboutUsOnHomePage from "@/components/home/AboutUsOnHomePage";

type HomePageProps = {
  lang: Locale;
  dict: Dictionary;
};

/** Homepage: stacked full-width sections in Figma order. */
export default function HomePage({ lang, dict }: HomePageProps) {
  return (
    <>
      <Banner lang={lang} dict={dict} />
      <FirstPart dict={dict} />
      <SecondPart lang={lang} dict={dict} />
      <ThirdPart lang={lang} dict={dict} />
      <FourthPart
        statement={dict.home.process.statement}
        steps={dict.home.process.steps}
        stepImageLabel={dict.home.process.stepImage}
      />
      <FifthPart lang={lang} dict={dict} />
      <AboutUsOnHomePage lang={lang} dict={dict} />
    </>
  );
}
