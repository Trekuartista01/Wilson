"use client";

import { useEffect, useRef } from "react";

type ListingPaneProps = {
  /** How many listings are rendered. When it grows ("Shfaq më shumë"), focus the first new one. */
  count: number;
  className?: string;
  children: React.ReactNode;
};

/**
 * Scroll box around the listing cards. On desktop it is exactly as tall as the map next to
 * it and scrolls on its own (Figma), so the list never runs past the bottom of the map.
 * After "Shfaq më shumë" it moves focus to the first newly loaded card, which also scrolls
 * it into view, so keyboard and screen reader users land on the new results.
 */
export default function ListingPane({ count, className = "", children }: ListingPaneProps) {
  const ref = useRef<HTMLDivElement>(null);
  const previous = useRef(count);

  useEffect(() => {
    const before = previous.current;
    previous.current = count;
    if (count <= before) return;
    // Only the cards themselves (a card's tags are list items too).
    const firstNew = ref.current?.querySelectorAll<HTMLElement>(":scope > ul > li")[before];
    if (!firstNew) return;
    firstNew.querySelector<HTMLElement>("a")?.focus({ preventScroll: true });
    // Next frame: scrolling during the navigation commit gets cancelled.
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const behavior = reduceMotion ? "auto" : "smooth";
    const frame = requestAnimationFrame(() => {
      const pane = ref.current;
      if (pane && pane.scrollHeight > pane.clientHeight) {
        // Desktop: scroll only the box, so the page and the map stay put.
        const top = firstNew.getBoundingClientRect().top - pane.getBoundingClientRect().top;
        pane.scrollBy({ top, behavior });
      } else {
        firstNew.scrollIntoView({ block: "start", behavior });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [count]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
