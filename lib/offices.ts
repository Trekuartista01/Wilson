// Wilson's offices: exact pins and Google Maps links (from the client, 2026-10-07).
// Same order as the dictionary's `aboutPage.offices` (names and addresses live there, translated).

export type OfficeLocation = { id: "tale" | "tirana" | "prishtina"; lat: number; lng: number; mapUrl: string };

export const offices: OfficeLocation[] = [
  { id: "tale", lat: 41.6898522, lng: 19.6150541, mapUrl: "https://maps.app.goo.gl/zynq5sFD8gYQMxHM6" },
  { id: "tirana", lat: 41.3211969, lng: 19.8149315, mapUrl: "https://maps.app.goo.gl/6c5yaBqYSu6UuCBf7" },
  { id: "prishtina", lat: 42.6618, lng: 21.164813, mapUrl: "https://maps.app.goo.gl/hRnB3xkFWi2Ltu5B6" },
];
