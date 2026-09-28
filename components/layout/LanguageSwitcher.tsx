"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiChevronDown } from "react-icons/fi";
import { LOCALE_COOKIE, localeLabels, localeNames, locales, type Locale } from "@/i18n/config";

type LanguageSwitcherProps = {
  lang: Locale;
  label: string;
};

/** Remembers the chosen language for the proxy redirect on "/" (not sensitive data). */
function rememberLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
}

/** Dropdown that swaps the locale prefix on the current URL and remembers the choice. */
export default function LanguageSwitcher({ lang, label }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const hrefFor = (target: Locale) => {
    // Swap only the locale segment; search filters are not carried over.
    return `/${target}${pathname.replace(/^\/[^/]+/, "")}`;
  };

  const choose = (target: Locale) => {
    rememberLocale(target);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`${label}: ${localeNames[lang]}`}
        className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1 px-2 text-[15px]"
      >
        {localeLabels[lang]}
        <FiChevronDown aria-hidden className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul className="absolute right-0 top-full z-50 mt-1 min-w-40 bg-surface py-1 text-ink shadow-lg ring-1 ring-black/5">
          {locales.map((locale) => (
            <li key={locale}>
              <Link
                href={hrefFor(locale)}
                hrefLang={locale}
                lang={locale}
                onClick={() => choose(locale)}
                aria-current={locale === lang ? "true" : undefined}
                className={`flex min-h-11 items-center justify-between gap-4 px-4 text-sm hover:bg-surface-subtle ${
                  locale === lang ? "font-semibold" : ""
                }`}
              >
                <span>{localeNames[locale]}</span>
                <span className="text-ink-subtle">{localeLabels[locale]}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
