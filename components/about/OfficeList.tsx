"use client";

import { useState } from "react";
import Image, { type StaticImageData } from "next/image";

type Office = { name: string; address: string; image: StaticImageData };

type OfficeListProps = {
  offices: Office[];
  /** Eyebrow ("ZYRAT"), rendered above the rows. */
  header: React.ReactNode;
};

/**
 * "Zyrat" on the About page ("ZYRAT" mockup), built like the homepage zone list: office photo
 * on the left, rows on the right. Hovering, focusing or tapping a row highlights it (the first
 * starts highlighted) and crossfades the photo to that office. Rows are buttons since there
 * is no office page to go to; on phones the photo sits above the rows and a tap switches it.
 */
export default function OfficeList({ offices, header }: OfficeListProps) {
  const [active, setActive] = useState(0);

  return (
    <div className="grid items-center gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-12 lg:gap-20">
      {/* All photos stacked and crossfading, so switching never waits on a download. Decorative:
          the rows name the offices. */}
      <div className="relative aspect-[4/3] overflow-hidden bg-placeholder shadow-[0_8px_30px_rgba(0,0,0,0.08)] md:aspect-[4/5]">
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
        <ul className="mt-6 sm:mt-8">
          {offices.map((office, i) => {
            const on = i === active;
            return (
              <li key={office.name} className={`border-b transition-colors ${on ? "border-transparent" : "border-divider"}`}>
                <button
                  type="button"
                  aria-pressed={on}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  className={`block w-full px-4 py-4 text-left transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-primary sm:py-5 ${
                    on ? "bg-surface-cream-strong" : ""
                  }`}
                >
                  <span className="block text-2xl sm:text-3xl">{office.name}</span>
                  <span className="mt-1 block text-sm text-brand-brown/70">{office.address}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
