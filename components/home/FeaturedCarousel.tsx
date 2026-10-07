"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { format } from "@/i18n/config";

export type FeaturedSlide = {
  slug: string;
  href: string;
  title: string;
  text: string;
  /** First listing photo; null shows a gray box. */
  image: string | null;
};

type FeaturedCarouselProps = {
  slides: FeaturedSlide[];
  labels: {
    view: string;
    previous: string;
    next: string;
    show: string;
    image: string;
  };
};

// Where a card sits, by its distance from the active one. The middle slot never moves: cards
// travel into it and out of it. All sizes are % of the stage, so nothing is measured in JS
// and the server render already has the final layout. Desktop numbers come from the mockup
// (1440 wide: middle card 440x620, side cards 300x380 flush with the screen edges).
const SLOT = {
  center: "z-20 top-0 h-full left-[14%] w-[72%] sm:left-[25%] sm:w-[50%] lg:left-[34.72%] lg:w-[30.56%]",
  left: "z-10 top-[20%] h-[60%] left-0 w-[10%] sm:w-[18%] lg:top-[19.35%] lg:h-[61.3%] lg:w-[20.83%]",
  right:
    "z-10 top-[20%] h-[60%] left-[90%] w-[10%] sm:left-[82%] sm:w-[18%] lg:top-[19.35%] lg:h-[61.3%] lg:left-[79.17%] lg:w-[20.83%]",
  farLeft:
    "z-0 opacity-0 top-[20%] h-[60%] left-[-12%] w-[10%] sm:left-[-20%] sm:w-[18%] lg:top-[19.35%] lg:h-[61.3%] lg:left-[-22%] lg:w-[20.83%]",
  farRight: "z-0 opacity-0 top-[20%] h-[60%] left-full w-[10%] sm:w-[18%] lg:top-[19.35%] lg:h-[61.3%] lg:w-[20.83%]",
} as const;

/** Distance from the active slide going round the loop: 0, ±1, ±2... */
function offsetOf(i: number, active: number, n: number) {
  let d = (((i - active) % n) + n) % n;
  if (d > n / 2) d -= n;
  return d;
}

function slotFor(offset: number, n: number): keyof typeof SLOT {
  if (offset === 0) return "center";
  // Two slides: the other one waits on the right.
  if (offset === 1 || (n === 2 && offset === -1)) return "right";
  if (offset === -1) return "left";
  return offset < 0 ? "farLeft" : "farRight";
}

/**
 * Featured listings carousel ("Wilson Home Page" mockup). The tall middle card stays put;
 * the arrows, the side cards (click), arrow keys and a swipe bring the previous or next
 * listing into the middle, sliding the others round. The middle card's title, text and
 * "Shiko pronën" button sit over it, wider than the card, as in the mockup.
 *
 * Entrance: when the carousel first scrolls into view, the three visible photos wipe in one
 * after another from left to right, then the title, text and arrows fade up.
 */
export default function FeaturedCarousel({ slides, labels }: FeaturedCarouselProps) {
  const [active, setActive] = useState(0);
  const n = slides.length;
  const go = (step: number) => setActive((a) => (a + step + n) % n);
  const current = slides[active];

  const reduceMotion = useReducedMotion();
  const { ref: stageRef, inView } = useInView({
    triggerOnce: true,
    threshold: 0.25,
  });
  const shown = inView || !!reduceMotion;
  // Wipe order of the entrance: left card, then the middle, then the right.
  const WIPE_ORDER: Partial<Record<keyof typeof SLOT, number>> = {
    left: 0,
    center: 1,
    right: 2,
  };
  const wipe = (slot: keyof typeof SLOT): React.CSSProperties => ({
    clipPath: shown ? "inset(0% 0% 0% 0%)" : "inset(0% 100% 0% 0%)",
    transition: `clip-path 1.1s cubic-bezier(.65,0,.35,1) ${(WIPE_ORDER[slot] ?? 0) * 0.22}s`,
  });
  const late = `transition-[opacity,translate] duration-700 ease-out ${
    shown ? "opacity-100 translate-y-0 delay-[800ms]" : "opacity-0 translate-y-4"
  }`;

  // Swipe on touch screens; vertical scrolling still works (touch-action: pan-y).
  const swipeFrom = useRef<number | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") swipeFrom.current = e.clientX;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (swipeFrom.current === null) return;
    const dx = e.clientX - swipeFrom.current;
    swipeFrom.current = null;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
  };

  const arrow =
    "size-11 items-center justify-center rounded-full border border-surface/50 text-surface transition-colors hover:border-brand-accent hover:text-brand-accent";
  const prevButton = (className: string) =>
    n > 1 && (
      <button type="button" onClick={() => go(-1)} aria-label={labels.previous} className={`${arrow} ${className}`}>
        <FiChevronLeft aria-hidden className="size-5" />
      </button>
    );
  const nextButton = (className: string) =>
    n > 1 && (
      <button type="button" onClick={() => go(1)} aria-label={labels.next} className={`${arrow} ${className}`}>
        <FiChevronRight aria-hidden className="size-5" />
      </button>
    );

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={current.title}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") go(-1);
        if (e.key === "ArrowRight") go(1);
      }}
    >
      <div
        ref={stageRef}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (swipeFrom.current = null)}
        className="relative mx-auto aspect-[100/94] touch-pan-y sm:aspect-[100/65] lg:aspect-[100/43]"
      >
        {slides.map((slide, i) => {
          const slot = slotFor(offsetOf(i, active, n), n);
          const isCenter = slot === "center";
          const isSide = slot === "left" || slot === "right";
          return (
            <div
              key={slide.slug}
              inert={!isCenter && !isSide}
              className={`absolute overflow-hidden rounded-tr-card rounded-bl-card transition-[left,top,width,height,opacity] duration-700 ease-[cubic-bezier(.65,0,.35,1)] motion-reduce:transition-none ${SLOT[slot]}`}
            >
              <div className="absolute inset-0 bg-surface/15" style={wipe(slot)}>
                {slide.image ? (
                  <Image
                    src={slide.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 31vw, (min-width: 640px) 50vw, 72vw"
                    className="object-cover"
                  />
                ) : (
                  <span className="sr-only">{labels.image}</span>
                )}
                {/* Darker in the middle so the white title reads; side cards dimmed. */}
                <span
                  aria-hidden
                  className={`absolute inset-0 transition-colors duration-700 ${isCenter ? "bg-black/45" : "bg-black/35"}`}
                />
                {isCenter && (
                  <Link href={slide.href} tabIndex={-1} aria-hidden className="absolute inset-0">
                    <span className="sr-only">{slide.title}</span>
                  </Link>
                )}
                {isSide && (
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={format(labels.show, { title: slide.title })}
                    className="absolute inset-0 cursor-pointer transition-colors hover:bg-black/20"
                  />
                )}
              </div>
            </div>
          );
        })}

        {/* Title, text and button of the middle listing, over the card and wider than it. */}
        <div
          className={`pointer-events-none absolute inset-x-0 top-[16%] z-30 flex justify-center px-4 sm:top-[24%] lg:top-[30%] ${late}`}
          aria-live="polite"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={current.slug}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              // Never wider than the middle card (SLOT.center), so long titles wrap inside it.
              className="flex max-w-[66%] flex-col items-center text-center sm:max-w-[46%] lg:max-w-[28%]"
            >
              <h3 className="line-clamp-4 text-[1.75rem] break-words text-balance leading-[1.1] tracking-tight uppercase sm:text-[2.25rem] lg:text-[2.5rem]">
                {current.title}
              </h3>
              <p className="mt-5 line-clamp-2 max-w-sm sm:line-clamp-3 text-[0.9375rem] leading-relaxed text-surface/80 sm:mt-8 lg:mt-10">
                {current.text}
              </p>
              <Link
                href={current.href}
                className="pointer-events-auto mt-5 inline-flex min-h-11 items-center rounded-tr-btn rounded-bl-btn bg-brand-accent px-6 text-xs tracking-[0.1em] text-ink uppercase transition-colors hover:bg-surface sm:mt-8 sm:text-sm"
              >
                {labels.view}
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>

        {prevButton(`absolute bottom-[3%] left-[26%] z-30 hidden lg:inline-flex ${late}`)}
        {nextButton(`absolute right-[26%] bottom-[3%] z-30 hidden lg:inline-flex ${late}`)}
      </div>

      <div className={`mt-6 flex justify-center gap-4 lg:hidden ${late}`}>
        {prevButton("inline-flex")}
        {nextButton("inline-flex")}
      </div>
    </div>
  );
}
