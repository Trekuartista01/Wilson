"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import type { MapMarker } from "@/components/map/LeafletMap";
import Map from "@/components/map/Map";

type Fact = { label: string; value: string };

type PropertyFactsProps = {
  /** Shown three at a time; the arrows page through them. */
  facts: Fact[];
  marker: MapMarker;
  labels: {
    previous: string;
    next: string;
    /** "Detajet {n} nga {total}" */
    page: string;
    contact: string;
    mapLabel: string;
    mapLoading: string;
  };
  /** Where "Kontakto Wilson" goes (the Contact page). */
  contactHref: string;
};

const PER_PAGE = 3;

/**
 * The band under the property hero ("Prona Detaje" mockup): a satellite map of the spot on the
 * left, and on black the key facts three at a time (ID, area, standout feature; then status,
 * type, municipality), arrows to switch, and "Kontakto Wilson".
 */
export default function PropertyFacts({ facts, marker, labels, contactHref }: PropertyFactsProps) {
  const pages = Math.max(1, Math.ceil(facts.length / PER_PAGE));
  const [[page, direction], setPage] = useState<[number, 1 | -1]>([0, 1]);
  const go = (dir: 1 | -1) => setPage(([p]) => [(p + dir + pages) % pages, dir]);
  const visible = facts.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  const arrow =
    "inline-flex size-11 items-center justify-center rounded-full border border-surface/40 text-surface transition-colors hover:border-surface hover:bg-surface hover:text-ink";

  return (
    <section className="grid bg-black text-surface lg:grid-cols-[minmax(0,42fr)_minmax(0,58fr)]">
      <Map
        label={labels.mapLabel}
        loadingLabel={labels.mapLoading}
        markers={[marker]}
        zoom={15}
        tiles="satellite"
        className="h-64 sm:h-80 lg:h-auto lg:min-h-[19rem]"
      />

      <div className="flex flex-col justify-between gap-10 px-4 py-10 sm:px-6 sm:py-12 lg:px-9 lg:py-12 xl:pr-14">
        <div className="relative overflow-hidden" aria-live="polite">
          <p className="sr-only">{labels.page.replace("{n}", String(page + 1)).replace("{total}", String(pages))}</p>
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.dl
              key={page}
              custom={direction}
              variants={{
                enter: (dir: number) => ({ opacity: 0, x: dir * 40 }),
                center: { opacity: 1, x: 0 },
                exit: (dir: number) => ({ opacity: 0, x: dir * -40 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="grid gap-6 sm:grid-cols-3 sm:gap-0"
            >
              {visible.map((fact) => (
                <div
                  key={fact.label}
                  className="min-w-0 border-surface/25 sm:border-l sm:px-6 sm:first:border-l-0 sm:first:pl-0 lg:px-8"
                >
                  <dt className="text-sm tracking-wide text-surface/60 uppercase sm:text-base lg:text-lg">{fact.label}</dt>
                  <dd className="mt-2 font-sans text-2xl font-semibold break-words sm:text-[1.7rem] lg:text-[2rem]">{fact.value}</dd>
                </div>
              ))}
            </motion.dl>
          </AnimatePresence>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          {pages > 1 ? (
            <div className="flex gap-5">
              <button type="button" onClick={() => go(-1)} aria-label={labels.previous} className={arrow}>
                <FiChevronLeft aria-hidden className="size-5" />
              </button>
              <button type="button" onClick={() => go(1)} aria-label={labels.next} className={arrow}>
                <FiChevronRight aria-hidden className="size-5" />
              </button>
            </div>
          ) : (
            <span />
          )}
          <a
            href={contactHref}
            className="inline-flex min-h-11 items-center rounded-tr-btn rounded-bl-btn bg-brand-accent px-9 text-xs tracking-[0.1em] text-ink uppercase transition-colors hover:bg-surface sm:text-sm"
          >
            {labels.contact}
          </a>
        </div>
      </div>
    </section>
  );
}
