"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiChevronLeft, FiChevronRight, FiImage, FiMap } from "react-icons/fi";
import type { MapMarker } from "@/components/map/LeafletMap";
import Container from "@/components/ui/Container";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";
import Map from "@/components/map/Map";

type PropertyGalleryProps = {
  imageCount: number;
  marker: MapMarker;
  labels: {
    gallery: string;
    showPhotos: string;
    showMap: string;
    previous: string;
    next: string;
    /** "Foto {n} nga {total}" */
    photo: string;
    mapLabel: string;
    mapLoading: string;
  };
};

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Full-width hero on the property page (Figma "Pronat Desc"): photo slider with a
 * photos / map toggle bottom left and a "01 — 05" counter bottom right.
 * Swipe, the arrow buttons or the keyboard arrows change the photo.
 * TODO: real photos from Supabase Storage (Milestone 3) with next/image, sizes="100vw".
 */
export default function PropertyGallery({ imageCount, marker, labels }: PropertyGalleryProps) {
  const [view, setView] = useState<"photos" | "map">("photos");
  const [[index, direction], setSlide] = useState<[number, 1 | -1]>([0, 1]);
  const total = Math.max(imageCount, 1);

  const go = (dir: 1 | -1) => setSlide(([i]) => [(i + dir + total) % total, dir]);
  const photoLabel = labels.photo.replace("{n}", String(index + 1)).replace("{total}", String(total));

  return (
    <section
      aria-label={labels.gallery}
      className="relative h-[50svh] min-h-64 overflow-hidden bg-surface-muted sm:h-[60svh] lg:h-[clamp(28rem,calc(100svh-var(--header-h)-9rem),40rem)]"
    >
      {view === "photos" ? (
        <div
          className="absolute inset-0"
          // Arrow keys work once focus is anywhere in the slider (e.g. on an arrow button).
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") go(-1);
            if (e.key === "ArrowRight") go(1);
          }}
        >
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
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
              <ImagePlaceholder aspect="h-full" label={photoLabel} />
            </motion.div>
          </AnimatePresence>

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
      ) : (
        <div className="absolute inset-0">
          <Map
            label={labels.mapLabel}
            loadingLabel={labels.mapLoading}
            markers={[marker]}
            zoom={13}
            className="h-full"
          />
        </div>
      )}

      {/* Bottom bar: view toggle (left) and counter (right), aligned to the page content. */}
      <Container className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-between pb-4 sm:pb-6">
        <div className="pointer-events-auto flex gap-2 sm:gap-3">
          {(
            [
              ["photos", labels.showPhotos, FiImage],
              ["map", labels.showMap, FiMap],
            ] as const
          ).map(([key, label, Icon]) => (
            <button
              key={key}
              type="button"
              onClick={() => setView(key)}
              aria-pressed={view === key}
              aria-label={label}
              className={`inline-flex h-11 w-14 items-center justify-center rounded-sm text-surface transition-colors ${
                view === key ? "bg-ink" : "bg-ink-muted hover:bg-ink"
              }`}
            >
              <Icon aria-hidden className="size-5" />
            </button>
          ))}
        </div>

        {view === "photos" && (
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
        )}
      </Container>
    </section>
  );
}
