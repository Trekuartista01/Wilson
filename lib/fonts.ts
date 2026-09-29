import localFont from "next/font/local";

// Brand fonts, self-hosted from public/fonts (not on Google Fonts). Shared by the site and
// the admin panel layouts.
// Gilmer: all body and UI text. Ego: wide display face for h1/h2 (see globals.css).
export const gilmer = localFont({
  src: [
    { path: "../public/fonts/gilmer-regular.otf", weight: "400", style: "normal" },
    { path: "../public/fonts/gilmer-bold.otf", weight: "700", style: "normal" },
    { path: "../public/fonts/gilmer-heavy.otf", weight: "800", style: "normal" },
  ],
  variable: "--font-gilmer",
  display: "swap",
});

export const ego = localFont({
  src: "../public/fonts/ego-regular.otf",
  weight: "400",
  variable: "--font-ego",
  display: "swap",
});
