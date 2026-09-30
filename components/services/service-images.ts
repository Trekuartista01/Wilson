// Photos for the four services, keyed by service slug (dictionary `services[].slug`).
// Used by the homepage service tiles (FifthPart) and the Services page.
// Files live in public/images/services/<Albanian service name>/. To swap a photo,
// change the import below (or replace the file).
import type { StaticImageData } from "next/image";
import sales from "@/public/images/services/Shitje Pronash/1.jpg";
import purchase from "@/public/images/services/Blerje Pronash/2.jpg";
import development from "@/public/images/services/Zhvillim/3.jpg";
import consulting from "@/public/images/services/Konsulence/4.jpg";

export const serviceImages: Record<string, StaticImageData> = {
  sales,
  purchase,
  development,
  consulting,
};
