"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FiArrowRight, FiArrowUpRight, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";
import WipeReveal from "@/components/ui/WipeReveal";
import { zoneImages } from "./zone-images";

type Zone = {
  slug: string;
  name: string;
  /** "Properties in Tale" */
  caption: string;
  /** "10 properties", or "coming soon" with no listings yet. */
  countLabel: string;
  /** "For sale", or "coming soon". */
  badge: string;
  /** Properties list filtered to this zone. */
  href: string;
};

type ZoneShowcaseProps = {
  zones: Zone[];
  allHref: string;
  labels: { details: string; viewAll: string; previous: string; next: string; image: string };
};

const pad = (n: number) => String(n).padStart(2, "0");
const REVEAL = { duration: 0.9, ease: [0.65, 0, 0.35, 1] } as const;
const EASE_OUT = [0.22, 1, 0.36, 1] as const;
/** Short slide-and-fade for text that changes with the picked zone (counter, caption, badge). */
const SWAP = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.3, ease: EASE_OUT },
} as const;

/**
 * Zone pills on the left; the picked zone's photo pops up in the middle (revealed upwards
 * over the previous one), and the next zone's photo waits on the right as a preview. The
 * counter and arrows step through the zones in a loop; clicking the preview goes forward.
 * Photos: zone-images.ts (gray box for a zone without one). All photos stay mounted, so
 * switching never waits for a download.
 *
 * Micro-animations: on first scroll-in the pills slide in one after another and both photos
 * wipe in; on every switch the counter, badge and caption slide over to the new zone; on hover
 * the pill arrows nudge right and the round photo button turns.
 */
export default function ZoneShowcase({ zones, allHref, labels }: ZoneShowcaseProps) {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  const n = zones.length;
  const nextIndex = (active + 1) % n;
  const zone = zones[active];

  const show = (i: number) => {
    if (i === active) return;
    setPrevious(active);
    setActive(i);
  };
  const step = (by: number) => show((active + by + n) % n);

  const counter = (
    <p className="flex text-sm font-bold tabular-nums">
      <span className="relative inline-flex overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={active} {...SWAP}>
            {pad(active + 1)}
          </motion.span>
        </AnimatePresence>
      </span>
      <span className="font-normal text-ink-subtle">/{pad(n)}</span>
    </p>
  );
  const arrows = (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={() => step(-1)}
        aria-label={labels.previous}
        className="inline-flex size-12 items-center justify-center rounded-xl border border-ink/10 bg-surface transition-colors hover:border-ink"
      >
        <FiChevronLeft aria-hidden className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => step(1)}
        aria-label={labels.next}
        className="inline-flex size-12 items-center justify-center rounded-xl bg-ink text-surface transition-colors hover:bg-brand-accent hover:text-ink"
      >
        <FiChevronRight aria-hidden className="size-4" />
      </button>
    </div>
  );

  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)] lg:grid-cols-[minmax(0,0.6fr)_minmax(0,1fr)_minmax(0,0.67fr)] lg:gap-8">
      {/* Zone pills */}
      <div>
        <ul className="space-y-3">
          {zones.map((z, i) => {
            const on = i === active;
            return (
              <motion.li
                key={z.slug}
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                transition={{ duration: 0.6, ease: EASE_OUT, delay: i * 0.08 }}
              >
                <button
                  type="button"
                  onClick={() => show(i)}
                  aria-current={on ? "true" : undefined}
                  className={`group flex min-h-13 w-full items-center gap-4 rounded-tr-btn rounded-bl-btn border py-1.5 pr-1.5 pl-5 text-left transition-[background-color,border-color,scale] active:scale-[0.98] ${
                    on ? "border-brand-accent bg-brand-accent" : "border-ink/10 bg-surface hover:border-ink/40"
                  }`}
                >
                  <span className="text-xs tabular-nums sm:text-sm">{pad(i + 1)}</span>
                  <span className="min-w-0 flex-1 leading-tight">
                    <span className="block truncate text-[0.95rem] font-bold">{z.name}</span>
                    <span className={`block truncate text-xs ${on ? "text-ink" : "text-ink-muted"}`}>
                      {z.countLabel}
                    </span>
                  </span>
                  <span
                    aria-hidden
                    className={`inline-flex size-9 shrink-0 items-center justify-center rounded-full transition-colors ${on ? "bg-surface" : "bg-surface-cream"}`}
                  >
                    <FiChevronRight
                      className={`size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 ${on ? "translate-x-0.5" : ""}`}
                    />
                  </span>
                </button>
              </motion.li>
            );
          })}
        </ul>
        <Link
          href={allHref}
          className="group mt-8 inline-flex min-h-11 items-center gap-2 rounded-tr-btn rounded-bl-btn bg-ink px-5 text-sm text-surface transition-colors hover:bg-brand-accent hover:text-ink lg:mt-12"
        >
          {labels.viewAll}
          <FiArrowRight aria-hidden className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Picked zone */}
      <div>
        <WipeReveal className="relative aspect-[50/44] rounded-tr-card rounded-bl-card bg-placeholder">
          {zones.map((z, i) => {
            const on = i === active;
            const img = zoneImages[z.slug];
            return (
              <motion.div
                key={z.slug}
                aria-hidden={!on}
                className="absolute inset-0"
                style={{ zIndex: on ? 2 : i === previous ? 1 : 0 }}
                initial={false}
                animate={
                  on
                    ? { clipPath: ["inset(100% 0% 0% 0%)", "inset(0% 0% 0% 0%)"], scale: [1.12, 1] }
                    : { clipPath: "inset(0% 0% 0% 0%)", scale: 1 }
                }
                transition={on && !reduceMotion ? REVEAL : { duration: 0 }}
              >
                {img ? (
                  <Image
                    src={img}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 35vw, (min-width: 768px) 55vw, 100vw"
                    placeholder="blur"
                    className="object-cover"
                  />
                ) : (
                  <ImagePlaceholder aspect="absolute inset-0 h-full" label={`${labels.image}: ${z.name}`} />
                )}
              </motion.div>
            );
          })}
          <div className="absolute top-4 left-4 z-10 sm:top-5 sm:left-5">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={zone.badge}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.25, ease: EASE_OUT }}
                className="block rounded-full bg-brand-accent px-4 py-1.5 text-xs"
              >
                {zone.badge}
              </motion.span>
            </AnimatePresence>
          </div>
          <Link
            href={zone.href}
            aria-label={zone.caption}
            className="group absolute top-1/2 left-1/2 z-10 inline-flex size-14 -translate-1/2 items-center justify-center rounded-full bg-surface text-ink transition-transform duration-300 hover:scale-110"
          >
            <FiArrowUpRight aria-hidden className="size-4 transition-transform duration-300 group-hover:rotate-45" />
          </Link>
        </WipeReveal>
        <div className="mt-6 flex items-start justify-between gap-4" aria-live="polite">
          <div className="relative min-w-0 overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div key={zone.slug} {...SWAP}>
                <h3 className="font-sans text-lg font-bold tracking-tight sm:text-xl">{zone.caption}</h3>
                <p className="mt-1 text-sm text-ink-muted sm:text-[0.95rem]">{zone.countLabel}</p>
              </motion.div>
            </AnimatePresence>
          </div>
          <Link
            href={zone.href}
            className="group inline-flex min-h-11 shrink-0 items-center gap-1.5 text-xs tracking-[0.12em] uppercase sm:text-sm"
          >
            {labels.details}
            <FiArrowRight aria-hidden className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        {/* Phones and tablets: no preview column, counter and arrows under the caption. */}
        <div className="mt-6 flex items-center justify-between lg:hidden">
          {counter}
          {arrows}
        </div>
      </div>

      {/* Next zone preview */}
      <div className="hidden lg:block">
        <WipeReveal from="left" delay={0.25} className="rounded-tr-card rounded-bl-card">
          <button
            type="button"
            onClick={() => step(1)}
            aria-label={`${labels.next}: ${zones[nextIndex].name}`}
            className="group relative block aspect-[336/260] w-full overflow-hidden bg-placeholder"
          >
            {zones.map((z, i) => {
              const img = zoneImages[z.slug];
              return (
                <span
                  key={z.slug}
                  aria-hidden
                  className={`absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none ${i === nextIndex ? "opacity-100" : "opacity-0"}`}
                >
                  {img ? (
                    <Image
                      src={img}
                      alt=""
                      fill
                      sizes="25vw"
                      placeholder="blur"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <ImagePlaceholder aspect="absolute inset-0 h-full" label={`${labels.image}: ${z.name}`} />
                  )}
                </span>
              );
            })}
          </button>
        </WipeReveal>
        <div className="mt-6 space-y-4">
          {counter}
          {arrows}
        </div>
      </div>
    </div>
  );
}
