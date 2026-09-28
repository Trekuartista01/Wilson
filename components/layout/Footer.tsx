import Link from "next/link";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { navItems, siteConfig } from "@/lib/site";
import Container from "@/components/ui/Container";
import Logo from "@/components/ui/Logo";

type FooterProps = {
  lang: Locale;
  dict: Dictionary;
};

/** Shared site footer. Layout follows the Figma "Footer" reference. */
export default function Footer({ lang, dict }: FooterProps) {
  const t = dict.footer;
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brand-darker text-surface">
      <Container className="pt-12 pb-8 sm:pt-16 lg:pt-20">
        <Logo href={localePath(lang)} size="lg" />

        <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:mt-14 lg:grid-cols-[1fr_1.2fr_auto] lg:gap-16">
          <div>
            <h2 className="text-sm font-semibold">{t.navigation}</h2>
            <ul className="mt-3 grid max-w-xs grid-cols-2 gap-x-8">
              {navItems.map((item) => (
                <li key={item.key}>
                  <Link
                    href={localePath(lang, item.href)}
                    className="inline-flex min-h-11 min-w-11 items-center text-surface/80 hover:text-surface"
                  >
                    {dict.nav[item.key]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold">{t.contact}</h2>
            <ul className="mt-3 space-y-1">
              <li>
                <a
                  href={siteConfig.phoneHref}
                  className="inline-flex min-h-11 items-center gap-3 underline underline-offset-4 hover:text-surface/80"
                >
                  <FiPhone aria-hidden className="shrink-0" />
                  {siteConfig.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="inline-flex min-h-11 items-center gap-3 break-all underline underline-offset-4 hover:text-surface/80"
                >
                  <FiMail aria-hidden className="shrink-0" />
                  {siteConfig.email}
                </a>
              </li>
              <li className="flex gap-3 pt-2 text-surface/80">
                <FiMapPin aria-hidden className="mt-1 shrink-0" />
                <address className="not-italic leading-relaxed">
                  {siteConfig.address.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold">{t.social}</h2>
            <ul className="mt-3">
              <li>
                <a
                  href={siteConfig.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-3 text-surface/80 hover:text-surface"
                >
                  <FaInstagram aria-hidden className="size-5" />
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-3 text-surface/80 hover:text-surface"
                >
                  <FaFacebookF aria-hidden className="size-5" />
                  Facebook
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-surface/10 pt-6 text-xs text-surface/70 sm:flex-row sm:items-center sm:justify-between lg:mt-16">
          <p>
            © {year} {siteConfig.name}. {t.rights}
          </p>
          {/* TODO: privacy and terms pages do not exist yet (content from client). */}
          <ul className="flex items-center">
            <li>
              <a href="#" className="inline-flex min-h-11 items-center pr-4 hover:text-surface">
                {t.privacy}
              </a>
            </li>
            <li className="border-l border-surface/20">
              <a href="#" className="inline-flex min-h-11 items-center pl-4 hover:text-surface">
                {t.terms}
              </a>
            </li>
          </ul>
        </div>
      </Container>
    </footer>
  );
}
