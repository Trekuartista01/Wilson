"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { FiMenu, FiX } from "react-icons/fi";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { navItems } from "@/lib/site";
import type { SearchSuggestion } from "@/lib/property-search";
import Container from "@/components/ui/Container";
import Logo from "@/components/ui/Logo";
import LanguageSwitcher, { LanguageLinks } from "./LanguageSwitcher";
import NavSearch from "./NavSearch";

type NavbarProps = {
  lang: Locale;
  labels: Dictionary["nav"];
  suggestions: SearchSuggestion[];
};

export default function Navbar({ lang, labels, suggestions }: NavbarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState(pathname);
  const [searchOpen, setSearchOpen] = useState(false);

  // Close the mobile menu when the route changes (derived during render, no effect needed).
  if (open && openedAt !== pathname) {
    setOpen(false);
  }

  // Pages with a full-screen hero ([data-hero]: homepage Banner, property gallery): the bar is
  // transparent over it and turns dark gray (#272727) as soon as the visitor scrolls.
  const [pastHero, setPastHero] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const hero = document.querySelector<HTMLElement>("[data-hero]");
      setPastHero(!hero || window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => {
    const full = localePath(lang, href);
    return href === "/" ? pathname === full : pathname === full || pathname.startsWith(`${full}/`);
  };

  // One navbar on every page (the "Wilson Home Page" design): pill links, search, inline
  // languages and a white button on #272727. Transparent over the heroes: the homepage video,
  // the About banner, the Contact hero and a property's photos (/properties/<slug>).
  const home = isActive("/");
  const heroPage =
    home ||
    pathname === localePath(lang, "/about") ||
    pathname === localePath(lang, "/contact") ||
    new RegExp(`^${localePath(lang, "/properties")}/[^/]+$`).test(pathname);
  const overlay = heroPage && !pastHero && !open;
  const bar = overlay ? "bg-transparent text-surface" : "bg-nav-dark text-surface";
  const properties = localePath(lang, "/properties");

  const toggle = () => {
    setOpenedAt(pathname);
    setOpen((v) => !v);
  };

  return (
    <header className={`sticky top-0 z-50 transition-colors duration-300 ${bar}`}>
      <Container
        className={`flex h-16 items-center justify-between gap-4 border-b transition-colors duration-300 sm:h-20 lg:h-24 ${
          overlay ? "border-surface/20" : "border-transparent"
        }`}
      >
        <Logo href={localePath(lang)} introTarget={home} />

        <nav aria-label={labels.mainNavigation} className="relative mr-auto ml-6 hidden items-center lg:flex xl:ml-14">
          {/* The links fade out while the search field is open over them. */}
          <ul inert={searchOpen} className={`flex items-center gap-2 transition-opacity duration-200 ${searchOpen ? "opacity-0" : ""}`}>
            {navItems.map((item, i) => {
              const active = isActive(item.href);
              return (
                <li key={item.key} data-intro-fade style={{ "--intro-delay": `${600 + i * 60}ms` } as React.CSSProperties}>
                  <Link
                    href={localePath(lang, item.href)}
                    aria-current={active ? "page" : undefined}
                    className="group inline-flex min-h-11 items-center"
                  >
                    <span
                      className={`inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm whitespace-nowrap transition-colors ${
                        active ? "bg-surface text-ink" : "bg-surface/20 text-surface backdrop-blur-sm group-hover:bg-surface/35"
                      }`}
                    >
                      {active && <span aria-hidden className="size-1.5 rounded-full bg-brand-accent" />}
                      {labels[item.key]}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <div data-intro-fade style={{ "--intro-delay": "900ms" } as React.CSSProperties} className="ml-6">
            <NavSearch labels={labels} suggestions={suggestions} action={properties} variant="bar" onOpenChange={setSearchOpen} />
          </div>
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          <div data-intro-fade style={{ "--intro-delay": "960ms" } as React.CSSProperties} className="hidden xl:block">
            <LanguageLinks lang={lang} label={labels.language} />
          </div>
          <Link
            href={properties}
            data-intro-fade
            style={{ "--intro-delay": "1020ms" } as React.CSSProperties}
            className="hidden h-11 items-center rounded-tr-btn rounded-bl-btn bg-surface px-5 text-sm whitespace-nowrap text-ink transition-colors hover:bg-brand-accent xl:ml-4 xl:inline-flex"
          >
            {labels.cta}
          </Link>
          <div className="xl:hidden">
            <LanguageSwitcher lang={lang} label={labels.language} />
          </div>
          <button
            type="button"
            onClick={toggle}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? labels.closeMenu : labels.openMenu}
            className="inline-flex size-11 items-center justify-center lg:hidden"
          >
            {open ? <FiX aria-hidden className="size-6" /> : <FiMenu aria-hidden className="size-6" />}
          </button>
        </div>
      </Container>

      {/* Mobile menu: search first, then the links. */}
      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-menu"
            aria-label={labels.mainNavigation}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-x-0 top-full max-h-[calc(100svh-var(--header-h))] overflow-y-auto border-t border-surface/10 bg-nav-dark text-surface shadow-xl lg:hidden"
          >
            <Container className="py-4">
              <NavSearch labels={labels} suggestions={suggestions} action={properties} variant="menu" />
              <ul className="mt-2 flex flex-col">
                {navItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <li key={item.key} className="border-b border-surface/10 last:border-b-0">
                      <Link
                        href={localePath(lang, item.href)}
                        aria-current={active ? "page" : undefined}
                        onClick={() => setOpen(false)}
                        className={`flex min-h-12 items-center gap-2 text-lg ${active ? "font-medium text-surface" : "text-surface/75 hover:text-surface"}`}
                      >
                        {active && <span aria-hidden className="size-1.5 rounded-full bg-brand-accent" />}
                        {labels[item.key]}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <Link
                href={properties}
                onClick={() => setOpen(false)}
                className="mt-4 flex min-h-12 items-center justify-center rounded-tr-btn rounded-bl-btn bg-surface px-4 text-ink"
              >
                {labels.cta}
              </Link>
            </Container>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
