"use client";

import { useEffect, useId, useRef } from "react";
import { LOGO_VIEWBOX, REAL_ESTATE_BOX, markPaths, realEstatePaths, wordPaths } from "./intro-logo";

/**
 * Homepage intro, remade from the designer's wilson-logo-intro.html.
 *
 * Two dark curtains cover the screen. The yellow W draws itself stroke by stroke, the WILSON
 * letters follow one after another, and REAL ESTATE wipes in behind a yellow caret. Then the
 * curtains part, the logo flies up and shrinks onto the navbar logo, the hero photo settles
 * from a slight zoom and the navbar items and headline fade up.
 *
 * Plays once per browser session, on a full page load of the homepage. INTRO_SCRIPT
 * (intro-script.ts, rendered inline just before this overlay by HomePage) decides before the first paint and sets
 * html[data-intro]; the CSS in globals.css does the rest of the hiding and revealing.
 * Any click, key, wheel or touch skips to the end. Reduced motion: never plays.
 */

/**
 * Playback speed: 1 = the designer's original timings, lower = faster. Every step below keeps
 * the designer's ms values and is scaled by this, so the animation looks the same, just quicker.
 * Keep in sync with --intro-speed in globals.css (the navbar/hero fade-in after the curtains open).
 */
const SPEED = 0.77;
/** The designer's total length, ms. Keyframe offsets are fractions of this. */
const DESIGN_T = 5200;
/** Total length actually played, ms. */
const T = DESIGN_T * SPEED;
/** The curtains start to part and the logo starts flying to the navbar (designer ms). */
const DESIGN_OPEN = 3600;
/** The logo lands on the navbar logo (designer ms). */
const DESIGN_LAND = 4900;
/** The same two moments in real playback time, for the timers. */
const OPEN_AT = DESIGN_OPEN * SPEED;
const LAND_AT = DESIGN_LAND * SPEED;
/** If the page took this long to become interactive, skip the intro instead of starting late. */
const LATE_START_MS = 4000;

/** Keyframe offset for a step given in the designer's ms. */
const at = (ms: number) => Math.min(1, ms / DESIGN_T);

// Strict Mode mounts effects twice in development; only a real unmount should end the intro.
let mountedCount = 0;

export default function IntroAnimation() {
  const clipId = useId();
  const lockRef = useRef<HTMLDivElement>(null);
  const curtainsRef = useRef<HTMLDivElement>(null);
  const wiperRef = useRef<SVGRectElement>(null);
  const caretRef = useRef<SVGRectElement>(null);

  useEffect(() => {
    mountedCount++;
    const html = document.documentElement;
    const cleanups: (() => void)[] = [];
    const cleanup = () => {
      cleanups.forEach((fn) => fn());
      mountedCount--;
      setTimeout(() => {
        if (!mountedCount && html.dataset.intro !== "done") html.dataset.intro = "done";
      }, 0);
    };

    const lock = lockRef.current;
    const curtains = curtainsRef.current;
    const wiper = wiperRef.current;
    const caret = caretRef.current;
    const target = document.querySelector<HTMLElement>("[data-intro-logo]");

    if (html.dataset.intro !== "play") return cleanup;
    if (!lock || !curtains || !wiper || !caret || !target || performance.now() > LATE_START_MS) {
      html.dataset.intro = "done";
      return cleanup;
    }

    const anims: Animation[] = [];
    const A = (el: Element, keyframes: Keyframe[]) => anims.push(el.animate(keyframes, { duration: T, fill: "both" }));

    // Mark: stroke draws in, then fills.
    lock.querySelectorAll(".intro-mark path").forEach((p) =>
      A(p, [
        { offset: 0, strokeDashoffset: 1, fillOpacity: 0 },
        { offset: at(1000), strokeDashoffset: 0, fillOpacity: 0, easing: "ease-out" },
        { offset: at(1250), strokeDashoffset: 0, fillOpacity: 1 },
        { offset: 1, strokeDashoffset: 0, fillOpacity: 1 },
      ]),
    );
    // WILSON: each glyph draws and fills 150ms after the one before.
    lock.querySelectorAll(".intro-word path").forEach((p, i) => {
      const s = 1150 + i * 150;
      A(p, [
        { offset: 0, strokeDashoffset: 1, fillOpacity: 0 },
        { offset: at(s), strokeDashoffset: 1, fillOpacity: 0, easing: "cubic-bezier(.5,0,.3,1)" },
        { offset: at(s + 520), strokeDashoffset: 0, fillOpacity: 0, easing: "ease-out" },
        { offset: at(s + 760), strokeDashoffset: 0, fillOpacity: 1 },
        { offset: 1, strokeDashoffset: 0, fillOpacity: 1 },
      ]);
    });
    // REAL ESTATE: a clip grows left to right while the caret runs ahead of it.
    A(wiper, [
      { offset: 0, transform: "scaleX(0)" },
      { offset: at(2550), transform: "scaleX(0)", easing: "cubic-bezier(.4,0,.2,1)" },
      { offset: at(3200), transform: "scaleX(1)" },
      { offset: 1, transform: "scaleX(1)" },
    ]);
    const run = `translateX(${REAL_ESTATE_BOX.width - 4}px)`;
    A(caret, [
      { offset: 0, opacity: 0, transform: "none" },
      { offset: at(2500), opacity: 0, transform: "none" },
      { offset: at(2550), opacity: 1, transform: "none", easing: "cubic-bezier(.4,0,.2,1)" },
      { offset: at(3200), opacity: 1, transform: run },
      { offset: at(3300), opacity: 0, transform: run },
      { offset: 1, opacity: 0, transform: run },
    ]);

    // Logo: centred, then flies onto the navbar logo and shrinks to its width.
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    const bw = lock.offsetWidth;
    const bh = lock.offsetHeight;
    const nav = target.getBoundingClientRect();
    const tr = (x: number, y: number, s: number) => `translate(${x}px, ${y}px) scale(${s})`;
    const start = tr((vw - bw) / 2, (vh - bh) / 2, 1);
    const end = tr(nav.left, nav.top, nav.width / bw);
    A(lock, [
      { offset: 0, opacity: 1, transform: start },
      { offset: at(DESIGN_OPEN), opacity: 1, transform: start, easing: "cubic-bezier(.6,0,.15,1)" },
      { offset: at(DESIGN_LAND), opacity: 1, transform: end },
      { offset: 1, opacity: 1, transform: end },
    ]);
    // Curtains part from the middle.
    curtains.querySelectorAll("[data-side]").forEach((c) => {
      const out = `translateX(${c.getAttribute("data-side") === "left" ? -101 : 101}%)`;
      A(c, [
        { offset: 0, transform: "none" },
        { offset: at(DESIGN_OPEN), transform: "none", easing: "cubic-bezier(.7,0,.2,1)" },
        { offset: at(4350), transform: out },
        { offset: 1, transform: out },
      ]);
    });

    const timers = [
      setTimeout(() => (html.dataset.intro = "open"), OPEN_AT),
      setTimeout(() => (html.dataset.intro = "done"), LAND_AT),
    ];

    const skip = () => {
      if (html.dataset.intro === "done") return;
      timers.forEach(clearTimeout);
      anims.forEach((a) => a.finish());
      html.dataset.intro = "done";
    };
    const events = ["pointerdown", "keydown", "wheel", "touchmove"] as const;
    events.forEach((e) => window.addEventListener(e, skip, { passive: true }));

    cleanups.push(() => {
      timers.forEach(clearTimeout);
      events.forEach((e) => window.removeEventListener(e, skip));
      anims.forEach((a) => a.cancel());
    });
    return cleanup;
  }, []);

  const { x, y, width, height } = REAL_ESTATE_BOX;

  return (
    <div aria-hidden className="intro-overlay pointer-events-none fixed inset-0 z-[90]">
      <div ref={curtainsRef}>
        <div data-side="left" className="absolute inset-y-0 left-0 w-[50.4%] bg-surface-dark" />
        <div data-side="right" className="absolute inset-y-0 right-0 w-[50.4%] bg-surface-dark" />
      </div>
      <div
        ref={lockRef}
        style={{ opacity: 0 }}
        className="absolute top-0 left-0 w-[84vw] origin-top-left md:w-[min(60vw,780px)]"
      >
        <svg viewBox={LOGO_VIEWBOX} className="block h-auto w-full overflow-visible">
          <defs>
            <clipPath id={clipId}>
              <rect
                ref={wiperRef}
                x={x}
                y={y}
                width={width}
                height={height}
                style={{ transformBox: "fill-box", transformOrigin: "left", transform: "scaleX(0)" }}
              />
            </clipPath>
          </defs>
          <g className="intro-mark fill-brand-accent stroke-brand-accent" strokeWidth={3} strokeDasharray={1}>
            {markPaths.map((d, i) => (
              <path key={i} d={d} pathLength={1} />
            ))}
          </g>
          <g className="intro-word fill-surface stroke-surface" strokeWidth={5} strokeDasharray={1}>
            {wordPaths.map((d, i) => (
              <path key={i} d={d} pathLength={1} />
            ))}
          </g>
          <g className="fill-surface" clipPath={`url(#${clipId})`}>
            {realEstatePaths.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>
          <rect ref={caretRef} x={x} y={y} width={8} height={66} className="fill-brand-accent" opacity={0} />
        </svg>
      </div>
    </div>
  );
}
