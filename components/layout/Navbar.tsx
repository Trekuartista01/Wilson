"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { FiMenu, FiX } from "react-icons/fi";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { navItems } from "@/lib/site";
import Container from "@/components/ui/Container";
import Logo from "@/components/ui/Logo";
import LanguageSwitcher from "./LanguageSwitcher";

type NavbarProps = {
  lang: Locale;
  labels: Dictionary["nav"];
};

export default function Navbar({ lang, labels }: NavbarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState(pathname);

  // Close the mobile menu when the route changes (derived during render, no effect needed).
  if (open && openedAt !== pathname) {
    setOpen(false);
  }

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

  const toggle = () => {
    setOpenedAt(pathname);
    setOpen((v) => !v);
  };

  return (
    <header className="relative z-50 bg-brand-dark text-surface">
      <Container className="flex h-16 items-center justify-between gap-4 sm:h-20 lg:h-24">
        <Logo href={localePath(lang)} />

        {/* Desktop navigation */}
        <nav aria-label={labels.mainNavigation} className="hidden lg:block">
          <ul className="flex items-center gap-6 xl:gap-10">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.key}>
                  <Link
                    href={localePath(lang, item.href)}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex min-h-11 items-center text-[15px] transition-colors ${
                      active
                        ? "font-medium text-surface underline decoration-1 underline-offset-8"
                        : "text-surface/75 hover:text-surface"
                    }`}
                  >
                    {labels[item.key]}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href={localePath(lang, "/properties")}
            className="hidden min-h-11 items-center bg-brand-primary px-4 text-[15px] text-surface transition-colors hover:bg-black xl:inline-flex"
          >
            {labels.cta}
          </Link>
          <LanguageSwitcher lang={lang} label={labels.language} />
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

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-menu"
            aria-label={labels.mainNavigation}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-x-0 top-full max-h-[calc(100svh-4rem)] overflow-y-auto border-t border-surface/10 bg-brand-dark shadow-xl lg:hidden"
          >
            <Container className="py-4">
              <ul className="flex flex-col">
                {navItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <li key={item.key} className="border-b border-surface/10 last:border-b-0">
                      <Link
                        href={localePath(lang, item.href)}
                        aria-current={active ? "page" : undefined}
                        onClick={() => setOpen(false)}
                        className={`flex min-h-12 items-center text-lg ${active ? "font-medium text-surface" : "text-surface/75"}`}
                      >
                        {labels[item.key]}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <Link
                href={localePath(lang, "/properties")}
                onClick={() => setOpen(false)}
                className="mt-4 flex min-h-12 items-center justify-center bg-brand-primary px-4 text-surface"
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
