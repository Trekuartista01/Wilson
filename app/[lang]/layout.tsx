import type { Metadata } from "next";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import "../globals.css";
import { hasLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";
import MotionProvider from "@/components/layout/MotionProvider";

// Brand fonts, self-hosted from public/fonts (not on Google Fonts).
// Gilmer: all body and UI text. Ego: wide display face for h1/h2 (see globals.css).
const gilmer = localFont({
  src: [
    { path: "../../public/fonts/gilmer-regular.otf", weight: "400", style: "normal" },
    { path: "../../public/fonts/gilmer-bold.otf", weight: "700", style: "normal" },
    { path: "../../public/fonts/gilmer-heavy.otf", weight: "800", style: "normal" },
  ],
  variable: "--font-gilmer",
  display: "swap",
});

const ego = localFont({
  src: "../../public/fonts/ego-regular.otf",
  weight: "400",
  variable: "--font-ego",
  display: "swap",
});

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: {
      default: dict.meta.home.title,
      template: `%s | ${dict.meta.siteName}`,
    },
    description: dict.meta.defaultDescription,
  };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <html lang={lang} className={`${gilmer.variable} ${ego.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col overflow-x-clip">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-100 focus:bg-surface focus:px-4 focus:py-3 focus:text-ink"
        >
          {dict.nav.skipToContent}
        </a>
        <MotionProvider>
          <Header lang={lang} dict={dict} />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer lang={lang} dict={dict} />
          <ScrollToTop label={dict.common.backToTop} />
        </MotionProvider>
      </body>
    </html>
  );
}
