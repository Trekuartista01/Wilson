// Photos for the About page and the homepage "Rreth Wilson" teaser.
// Files live in public/images/story/ and public/images/offices/. To swap a photo, change the
// import below (or replace the file).
import type { StaticImageData } from "next/image";
import story from "@/public/images/story/about.jpg";
import tale from "@/public/images/offices/tale2.jpg";
import tirana from "@/public/images/offices/tirana2.jpg";
import kosovo from "@/public/images/offices/kosove2.jpg";

/** Coastal aerial: homepage "Rreth Wilson" teaser and the About page banner. */
export const storyImage = story;

/** Full-width photo between "Forca kryesore" and "Misioni & vizioni" on the About page. */
export const aboutWideImage = tirana;

/** "Zyrat" section, same order as the dictionary's `aboutPage.offices` (Tale, Tiranë, Kosovë). */
export const officeImages: StaticImageData[] = [tale, tirana, kosovo];
