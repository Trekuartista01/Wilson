// Photos for the homepage zone list, keyed by zone slug (data/properties.ts `homepageZones`).
// Files live in public/images/areas/. To swap a photo, change the import below (or replace the file).
import type { StaticImageData } from "next/image";
import tale from "@/public/images/areas/Tale,lezhe,albania.jpg";
import shengjin from "@/public/images/areas/sengin.jpg";
import vain from "@/public/images/areas/Vain_sky_and_lagoon.jpg";
import kune from "@/public/images/areas/Kune.jpg";

export const zoneImages: Record<string, StaticImageData> = { tale, shengjin, vain, kune };
