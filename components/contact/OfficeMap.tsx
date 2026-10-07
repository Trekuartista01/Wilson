"use client";

import { useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import type { OfficeLocation } from "@/lib/offices";
import Map from "@/components/map/Map";
import Container from "@/components/ui/Container";

type Office = OfficeLocation & { name: string; address: string };

const ORDER: OfficeLocation["id"][] = ["tirana", "prishtina", "tale"];

type OfficeMapProps = {
  offices: Office[];
  brand: string;
  t: { eyebrow: string; directions: string; switchLabel: string };
  mapLabel: string;
  loadingLabel: string;
};

/**
 * Contact page: the offices on a dark map with an address card on top. The switch in the card
 * (Tiranë / Prishtinë / Tale) moves the map to that office and swaps the address and the
 * directions link (the office's Google Maps pin).
 */
export default function OfficeMap({ offices, brand, t, mapLabel, loadingLabel }: OfficeMapProps) {
  // Switch order; Tirana (head office) shows first.
  const order = ORDER.map((id) => offices.findIndex((o) => o.id === id));
  const [active, setActive] = useState(order[0]);
  const office = offices[active];

  return (
    <section aria-label={t.eyebrow} className="relative">
      {/* Behind the map's rounded corners: the cream page above, the black footer below. On
          phones the card sits under the map on cream, so the corner stays cream there. */}
      <div className="lg:bg-[linear-gradient(to_bottom,var(--color-surface-cream)_50%,var(--color-brand-darker)_50%)]">
        <Map
          label={mapLabel}
          loadingLabel={loadingLabel}
          markers={offices.map((o) => ({ id: o.id, lat: o.lat, lng: o.lng, title: brand, subtitle: o.address }))}
          center={[office.lat, office.lng]}
          zoom={15}
          className="h-[22rem] rounded-tr-band rounded-bl-band sm:h-[26rem] lg:h-[34rem]"
        />
      </div>
      <Container className="relative z-10 -mt-20 pb-16 sm:-mt-24 lg:pointer-events-none lg:absolute lg:inset-0 lg:mt-0 lg:flex lg:items-center lg:pb-0">
        <div className="pointer-events-auto rounded-tr-card rounded-bl-card bg-surface p-6 shadow-xl sm:w-full sm:max-w-sm sm:p-8">
          <p className="text-xs tracking-[0.12em] text-ink-muted uppercase">{t.eyebrow}</p>
          <div role="group" aria-label={t.switchLabel} className="mt-4 flex flex-wrap gap-2">
            {order.map((i) => {
              const on = i === active;
              return (
                <button
                  key={offices[i].id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setActive(i)}
                  className={`min-h-11 cursor-pointer rounded-tr-btn rounded-bl-btn border px-4 text-sm transition-colors ${
                    on ? "border-brand-accent bg-brand-accent text-ink" : "border-ink/15 hover:border-ink/50"
                  }`}
                >
                  {/* "Prishtinë, Kosovë" -> "Prishtinë" */}
                  {offices[i].name.split(",")[0]}
                </button>
              );
            })}
          </div>
          <p className="mt-5 text-xl sm:text-2xl">{brand}</p>
          {/* Every address is laid out in the same cell and only the picked one shows, so the card
              keeps the size of the longest (Tirana) whichever office is picked. */}
          <div aria-live="polite" className="mt-2 grid text-sm leading-relaxed text-ink-muted">
            {offices.map((o, i) => (
              <address
                key={o.id}
                aria-hidden={i !== active}
                className={`col-start-1 row-start-1 not-italic ${i === active ? "" : "invisible"}`}
              >
                <span className="block text-ink">{o.name}</span>
                {o.address}
              </address>
            ))}
          </div>
          <a
            href={office.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-6 inline-flex min-h-11 items-center gap-3 rounded-tr-btn rounded-bl-btn bg-ink px-5 text-sm text-surface transition-colors hover:bg-brand-cta hover:text-ink"
          >
            {t.directions}
            <FiArrowRight aria-hidden className="transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </Container>
    </section>
  );
}
