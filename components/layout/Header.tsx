import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import Navbar from "./Navbar";

type HeaderProps = {
  lang: Locale;
  dict: Dictionary;
};

/** Shared site header. Server wrapper that passes only the nav strings to the client Navbar. */
export default function Header({ lang, dict }: HeaderProps) {
  return <Navbar lang={lang} labels={dict.nav} />;
}
