"use client";

import { useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { FiChevronRight } from "react-icons/fi";

type Office = { name: string; address: string; image: StaticImageData; mapUrl: string };

type OfficeListProps = {
  offices: Office[];
  /** Eyebrow ("ZYRAT"), rendered above the rows. */
  header: React.ReactNode;
  /** "Open in Google Maps", read out after the office name (the rows open a new tab). */
  mapLabel: string;
};

/**
 * "Zyrat" on the About page ("ZYRAT" mockup), built like the homepage zone list: office photo
 * on the left, rows on the right. Hovering, focusing or tapping a row highlights it (the first
 * starts highlighted, yellow like the homepage zone buttons) and crossfades the photo to that
 * office. Clicking a row opens that office's pin in Google Maps in a new tab; on phones the photo
 * sits above the rows.
 */
export default function OfficeList({ offices, header, mapLabel }: OfficeListProps) {
  const [active, setActive] = useState(0);

  return (
    <div className="grid items-center gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-12 lg:gap-20">
      {/* All photos stacked and crossfading, so switching never waits on a download. Decorative:
          the rows name the offices. */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-tr-card rounded-bl-card bg-placeholder shadow-[0_8px_30px_rgba(0,0,0,0.08)] md:aspect-[4/5]">
        {offices.map((office, i) => (
          <Image
            key={office.name}
            src={office.image}
            alt=""
            fill
            sizes="(min-width: 768px) 40vw, 100vw"
            placeholder="blur"
            className={`object-cover transition-opacity duration-500 motion-reduce:transition-none ${
              i === active ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>

      <div className="max-w-lg">
        {header}
        {/* Rows styled like the homepage zone buttons (ZoneShowcase): number, name and address,
            chevron; the picked one turns yellow. */}
        <ul className="mt-6 space-y-3 sm:mt-8">
          {offices.map((office, i) => {
            const on = i === active;
            return (
              <li key={office.name}>
                <a
                  href={office.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  className={`group flex min-h-16 w-full items-center gap-4 rounded-tr-btn rounded-bl-btn border py-2 pr-2 pl-5 text-left transition-[background-color,border-color,scale] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary active:scale-[0.98] ${
                    on ? "border-brand-accent bg-brand-accent" : "border-ink/10 bg-surface hover:border-ink/40"
                  }`}
                >
                  <span className="text-xs tabular-nums sm:text-sm">{String(i + 1).padStart(2, "0")}</span>
                  <span className="min-w-0 flex-1 leading-tight">
                    <span className="block text-lg font-bold sm:text-xl">{office.name}</span>
                    <span className={`mt-0.5 block text-xs sm:text-sm ${on ? "text-ink" : "text-ink-muted"}`}>
                      {office.address}
                    </span>
                  </span>
                  <span className="sr-only">({mapLabel})</span>
                  <span
                    aria-hidden
                    className={`inline-flex size-10 shrink-0 items-center justify-center rounded-full transition-colors ${on ? "bg-surface" : "bg-surface-cream"}`}
                  >
                    <FiChevronRight
                      className={`size-4 transition-transform duration-300 group-hover:translate-x-0.5 ${on ? "translate-x-0.5" : ""}`}
                    />
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
