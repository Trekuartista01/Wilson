"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";
import { zoneImages } from "./zone-images";

type ZoneRow = {
  slug: string;
  name: string;
  /** "10 prona", or "së shpejti" when the zone has no listings yet. */
  countLabel: string;
  /** Properties list filtered to this zone. */
  href: string;
};

type ZoneListProps = {
  zones: ZoneRow[];
  imageLabel: string;
  /** Eyebrow + heading, rendered above the rows in the left column. */
  header: React.ReactNode;
};

/**
 * Zone rows on the left, photo on the right. Hovering or focusing a row highlights it (the
 * first row starts highlighted, as in the mockup) and shows that zone's photo. Clicking goes
 * to the properties list with the zone filter set. Photos come from zone-images.ts; a zone
 * without one shows the gray placeholder. Phones skip the photo (no hover there).
 */
export default function ZoneList({ zones, imageLabel, header }: ZoneListProps) {
  const [active, setActive] = useState(zones[0]?.slug);
  const current = zones.find((z) => z.slug === active);

  return (
    <div className="grid items-start gap-10 md:grid-cols-[1fr_1.35fr] md:gap-12 lg:gap-24">
      <div>
        {header}
        <ul>
          {zones.map((zone) => {
            const on = zone.slug === active;
            return (
              <li key={zone.slug} className={`border-b transition-colors ${on ? "border-transparent" : "border-divider"}`}>
                <Link
                  href={zone.href}
                  onMouseEnter={() => setActive(zone.slug)}
                  onFocus={() => setActive(zone.slug)}
                  className={`flex min-h-16 items-center justify-between gap-4 px-4 py-4 transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-primary sm:min-h-21 ${
                    on ? "bg-surface-cream-strong" : ""
                  }`}
                >
                  <span className="text-xl sm:text-2xl">{zone.name}</span>
                  <span className="text-sm text-brand-brown sm:text-base">{zone.countLabel}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      {/* Top edge lines up with the heading, below the eyebrow. All photos are stacked and
          crossfade, so switching zones never waits on a download. Decorative: the rows name them. */}
      <div className="relative hidden aspect-[16/10] overflow-hidden bg-placeholder md:mt-9 md:block">
        {zones.map((zone) =>
          zoneImages[zone.slug] ? (
            <Image
              key={zone.slug}
              src={zoneImages[zone.slug]}
              alt=""
              fill
              sizes="55vw"
              placeholder="blur"
              className={`object-cover transition-opacity duration-500 motion-reduce:transition-none ${
                zone.slug === active ? "opacity-100" : "opacity-0"
              }`}
            />
          ) : (
            zone.slug === active && (
              <ImagePlaceholder
                key={zone.slug}
                aspect="absolute inset-0 h-full"
                label={current ? `${imageLabel}: ${current.name}` : imageLabel}
              />
            )
          ),
        )}
      </div>
    </div>
  );
}
