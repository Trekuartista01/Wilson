"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";

export type LatLng = { lat: number; lng: number };

// Same CSS pin as the public maps (globals.css .map-pin).
const pinIcon = L.divIcon({
  className: "",
  html: '<span class="map-pin"></span>',
  iconSize: [28, 28],
  iconAnchor: [14, 34],
});

const ALBANIA_CENTER: [number, number] = [41.15, 20.0];

function ClickToPlace({ onChange }: { onChange: (p: LatLng) => void }) {
  useMapEvents({ click: (e) => onChange({ lat: e.latlng.lat, lng: e.latlng.lng }) });
  return null;
}

/** Map for choosing a listing's position: click to place the pin, or drag it. */
export default function LeafletPicker({ value, onChange }: { value: LatLng | null; onChange: (p: LatLng) => void }) {
  return (
    <MapContainer
      center={value ? [value.lat, value.lng] : ALBANIA_CENTER}
      zoom={value ? 13 : 7}
      scrollWheelZoom={false}
      style={{ position: "absolute", inset: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        className="map-tiles-dark"
      />
      <ClickToPlace onChange={onChange} />
      {value && (
        <Marker
          position={[value.lat, value.lng]}
          icon={pinIcon}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const p = (e.target as L.Marker).getLatLng();
              onChange({ lat: p.lat, lng: p.lng });
            },
          }}
        />
      )}
    </MapContainer>
  );
}
