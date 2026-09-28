"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

export type MapMarker = {
  id: string;
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
};

export type LeafletMapProps = {
  markers: MapMarker[];
  /** Fit the view to Albania's borders (properties map). Otherwise use center + zoom. */
  fitAlbania?: boolean;
  center?: [number, number];
  zoom?: number;
};

// Albania's bounding box (SW, NE), with a little padding.
const ALBANIA_BOUNDS: L.LatLngBoundsExpression = [
  [39.62, 19.25],
  [42.68, 21.08],
];

// CSS-only pin (styled in globals.css) avoids Leaflet's default marker image paths,
// which break under bundlers. TODO: brand color. Pin uses --color-brand-primary.
const pinIcon = L.divIcon({
  className: "",
  html: '<span class="map-pin"></span>',
  iconSize: [28, 28],
  iconAnchor: [14, 34], // tip of the rotated square
  popupAnchor: [0, -34],
});

export default function LeafletMap({ markers, fitAlbania = false, center, zoom = 13 }: LeafletMapProps) {
  const view = fitAlbania
    ? { bounds: ALBANIA_BOUNDS }
    : { center: center ?? [markers[0]?.lat ?? 41.33, markers[0]?.lng ?? 19.82], zoom };

  return (
    <MapContainer
      {...view}
      // Page scroll must never get trapped by the map: no wheel zoom, and on touch devices
      // one-finger drag scrolls the page (pinch still zooms and pans).
      scrollWheelZoom={false}
      dragging={!L.Browser.mobile}
      style={{ position: "absolute", inset: 0 }}
    >
      {/* TODO: OSM's public tiles are fine for development; pick a tile provider
          (MapTiler, Stadia, Carto...) with a proper plan before launch. */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map((m) => (
        <Marker key={m.id} position={[m.lat, m.lng]} icon={pinIcon} title={m.title} alt={m.title}>
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
