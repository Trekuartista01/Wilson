"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import type { PropertyImage } from "@/data/properties";
import Container from "@/components/ui/Container";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";

type PropertyGalleryProps = {
  images: PropertyImage[];
  /** Listing title, used in each photo's alt text. */
  title: string;
  /** "Tale · Lezhë · Shitje" above the heading. */
  meta: string;
  /** The page heading, in two parts: "Tale" — "Parcelë 8,400 m²". */
  heading: [string, string];
  labels: {
    gallery: string;
    previous: string;
    next: string;
    /** "Foto {n} nga {total}" */
    photo: string;
  };
};

const pad = (n: number) => String(n).padStart(2, "0");

// Full screen: every photo fills the box edge to edge (cropped as needed, no blurred sides).
function GalleryPhoto({ image, alt, priority }: { image: PropertyImage; alt: string; priority: boolean }) {
  return (
    <Image
      src={image.url}
      alt={alt}
      fill
      sizes="100vw"
      draggable={false}
      {...(priority ? { priority: true } : { loading: "eager" as const })}
      className="object-cover select-none"
    />
  );
}

/**
 * Full-screen hero on the property page ("Prona Detaje" mockup): photo slider behind the
 * transparent navbar ([data-hero], see Navbar), with the place and heading and a "01 — 05"
 * counter bottom right. No map view here: the facts band and the Location section below have maps.
 * Swipe, the arrow buttons or the keyboard arrows change the photo.
 * Photos come from Supabase Storage; a listing without photos shows one gray placeholder.
 */
export default function PropertyGallery({ images, title, meta, heading, labels }: PropertyGalleryProps) {
  const [[index, direction], setSlide] = useState<[number, 1 | -1]>([0, 1]);
  const total = Math.max(images.length, 1);

  const go = (dir: 1 | -1) => setSlide(([i]) => [(i + dir + total) % total, dir]);

  // The photos either side of the current one, loaded ahead so a slide never shows an empty box.
  const neighbours =
    images.length > 1 ? [...new Set([(index + 1) % images.length, (index - 1 + images.length) % images.length])] : [];
  const photoLabel = labels.photo.replace("{n}", String(index + 1)).replace("{total}", String(total));

  return (
    <section
      aria-label={labels.gallery}
      data-hero
      // Full screen, running up behind the sticky header like the homepage hero.
      className="relative isolate -mt-(--header-h) h-svh max-h-[70rem] min-h-[32rem] overflow-hidden bg-nav-dark"
    >
      <div
        className="absolute inset-0"
        // Arrow keys work once focus is anywhere in the slider (e.g. on an arrow button).
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") go(-1);
          if (e.key === "ArrowRight") go(1);
        }}
      >
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={index}
            custom={direction}
            variants={{
              enter: (dir: number) => ({ x: `${dir * 100}%` }),
              center: { x: 0 },
              exit: (dir: number) => ({ x: `${dir * -100}%` }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "tween", duration: 0.35, ease: "easeOut" }}
            drag={total > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60) go(1);
              else if (info.offset.x > 60) go(-1);
            }}
            className="absolute inset-0 touch-pan-y"
          >
            {images[index] ? (
              <GalleryPhoto image={images[index]} alt={`${title}: ${photoLabel}`} priority={index === 0} />
            ) : (
              <ImagePlaceholder aspect="h-full" label={photoLabel} />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Preload the neighbours with the same sizes, so the browser reuses the download. */}
        <div aria-hidden className="pointer-events-none invisible absolute inset-0">
          {neighbours.map((i) => (
            <Image key={images[i].url} src={images[i].url} alt="" fill sizes="100vw" loading="eager" />
          ))}
        </div>

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label={labels.previous}
              className="absolute top-1/2 left-3 z-10 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-surface/80 text-ink shadow transition-colors hover:bg-surface sm:left-6"
            >
              <FiChevronLeft aria-hidden className="size-6" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label={labels.next}
              className="absolute top-1/2 right-3 z-10 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-surface/80 text-ink shadow transition-colors hover:bg-surface sm:right-6"
            >
              <FiChevronRight aria-hidden className="size-6" />
            </button>
          </>
        )}
      </div>

      {/* Darker at the top for the navbar and at the bottom for the heading. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/45 via-transparent via-35% to-black/65"
      />

      {/* Place and heading, then the counter (right). */}
      <Container className="pointer-events-none absolute inset-x-0 bottom-0 z-10 pb-4 sm:pb-6">
        <div className="mb-5 text-surface sm:mb-6">
          <p className="text-sm text-surface/75 sm:text-base lg:text-lg">{meta}</p>
          <h1 className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-2xl font-semibold tracking-tight sm:gap-x-4 sm:text-3xl lg:text-[2.4rem]">
            <span>{heading[0]}</span>
            <span aria-hidden className="h-px w-8 bg-surface sm:w-10" />
            <span>{heading[1]}</span>
          </h1>
        </div>
        <div className="flex items-end justify-end">
          <p className="flex items-center gap-2 rounded-sm bg-surface-muted/70 px-2 py-1 text-sm tabular-nums">
            <span className="sr-only" aria-live="polite">
              {photoLabel}
            </span>
            <span aria-hidden className="font-semibold">
              {pad(index + 1)}
            </span>
            <span aria-hidden className="h-px w-8 bg-ink/60" />
            <span aria-hidden className="text-ink-muted">
              {pad(total)}
            </span>
          </p>
        </div>
      </Container>
    </section>
  );
}
