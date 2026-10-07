"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import Link from "next/link";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

export type MapMarker = {
  id: string;
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
  /** "place": a small dot for a close-by place around the listing's pin (property page). */
  variant?: "pin" | "place";
};

export type LeafletMapProps = {
  markers: MapMarker[];
  /** Fit the view to Albania's borders (properties map). Otherwise use center + zoom. */
  fitAlbania?: boolean;
  center?: [number, number];
  zoom?: number;
  /** Map style: dark (default, every map on the site since 2026-10-06), satellite photos, or plain OpenStreetMap streets. */
  tiles?: "street" | "satellite" | "dark";
  /** Open the first pin's popup as soon as the map loads (property page). */
  openPopup?: boolean;
};

// TODO before launch: OSM's public tiles are fine for development but not meant for a busy
// commercial site; pick a tile plan (MapTiler, Stadia, Carto...) for production.
// "dark" is the same OSM map with its colours inverted (.map-tiles-dark in globals.css),
// so it needs no extra provider or key.
const TILES = {
  street: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    className: "",
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community",
    className: "",
  },
  dark: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    className: "map-tiles-dark",
  },
};

// Albania's bounding box (SW, NE), with a little padding.
const ALBANIA_BOUNDS: L.LatLngBoundsExpression = [
  [39.62, 19.25],
  [42.68, 21.08],
];

// CSS-only pin (styled in globals.css) avoids Leaflet's default marker image paths,
// which break under bundlers. Pin uses --color-brand-accent.
const pinIcon = L.divIcon({
  className: "",
  html: '<span class="map-pin"></span>',
  iconSize: [28, 28],
  iconAnchor: [14, 34], // tip of the rotated square
  popupAnchor: [0, -34],
});

// Close-by places (beach, shop, hospital...): a small white dot, so the listing's pin stands out.
const placeIcon = L.divIcon({
  className: "",
  html: '<span class="map-dot"></span>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  popupAnchor: [0, -8],
});

export default function LeafletMap({
  markers,
  fitAlbania = false,
  center,
  zoom = 13,
  tiles = "dark",
  openPopup = false,
}: LeafletMapProps) {
  const target: [number, number] = center ?? [markers[0]?.lat ?? 41.33, markers[0]?.lng ?? 19.82];
  const view = fitAlbania ? { bounds: ALBANIA_BOUNDS } : { center: target, zoom };

  return (
    <MapContainer
      {...view}
      // Page scroll must never get trapped by the map: no wheel zoom, and on touch devices
      // one-finger drag scrolls the page (pinch still zooms and pans).
      scrollWheelZoom={false}
      dragging={!L.Browser.mobile}
      style={{ position: "absolute", inset: 0 }}
    >
      <TileLayer key={tiles} {...TILES[tiles]} />
      {!fitAlbania && <FollowCenter lat={target[0]} lng={target[1]} zoom={zoom} />}
      {markers.map((m, i) => (
        <Marker
          key={m.id}
          position={[m.lat, m.lng]}
          icon={m.variant === "place" ? placeIcon : pinIcon}
          title={m.title}
          alt={m.title}
          // "add" fires once, when the pin is placed on the map.
          eventHandlers={openPopup && i === 0 ? { add: (e) => e.target.openPopup() } : undefined}
        >
          <Popup>
            <strong className="block text-sm">{m.title}</strong>
            {m.subtitle && <span className="mt-0.5 block text-xs text-ink-muted">{m.subtitle}</span>}
            {m.href && m.linkLabel && (
              <Link href={m.href} className="mt-2 inline-block text-xs font-medium underline underline-offset-2">
                {m.linkLabel} →
              </Link>
            )}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

// MapContainer only reads center/zoom once; this moves the view when they change later
// (the contact page's office switch). Pans when the target is close, jumps when it is not.
function FollowCenter({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    const current = map.getCenter();
    if (current.lat === lat && current.lng === lng) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    map.setView([lat, lng], zoom, { animate: !reduce });
  }, [map, lat, lng, zoom]);
  return null;
}
