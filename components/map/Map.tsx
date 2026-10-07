"use client";

import dynamic from "next/dynamic";
import type { LeafletMapProps } from "./LeafletMap";

// Leaflet touches `window`, so it only loads in the browser.
const LeafletMap = dynamic(() => import("./LeafletMap"), { ssr: false });

type MapProps = LeafletMapProps & {
  /** Accessible name for the map region. */
  label: string;
  loadingLabel: string;
  /** Size classes. The map fills this box. */
  className?: string;
};

/**
 * Interactive OpenStreetMap map with pins. Used by the properties list, the property
 * detail page and the contact page.
 * `isolate z-0` keeps Leaflet's high z-index panes below the header and mobile menu.
 */
export default function Map({ label, loadingLabel, className = "", ...mapProps }: MapProps) {
  return (
    <div role="region" aria-label={label} className={`relative isolate z-0 overflow-hidden bg-[#2b2b2b] ${className}`}>
      <p className="absolute inset-0 flex items-center justify-center text-sm text-surface/60">{loadingLabel}</p>
      <LeafletMap {...mapProps} />
    </div>
  );
}
