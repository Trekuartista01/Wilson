"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";

type ScrollWordsProps = {
  text: string;
  className?: string;
  as?: "h2" | "p";
  /** "fast": the words fill in over a shorter stretch of scrolling and follow it more tightly. */
  speed?: "normal" | "fast";
};

const SPEEDS = {
  // 0 when the top of the text enters the bottom of the screen, 1 when its bottom reaches
  // the upper third: a long stretch of scrolling, so the words fill in slowly.
  normal: { offset: ["start 0.95", "end 0.35"], spring: { stiffness: 60, damping: 20 } },
  // Done by the time the text's bottom reaches the middle of the screen.
  fast: { offset: ["start 0.9", "end 0.55"], spring: { stiffness: 140, damping: 26 } },
} as const;

/**
 * Scroll-linked word reveal: the text is always readable, starting light gray and faint,
 * and each word darkens to full ink in turn as the text scrolls up the screen (reverses
 * when scrolling back). Opacity and color only, so no layout shift and no blur.
 * Reduced motion renders the plain text.
 */
export default function ScrollWords({ text, className, as = "h2", speed = "normal" }: ScrollWordsProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const reduceMotion = useReducedMotion();
  const { offset, spring } = SPEEDS[speed];
  const { scrollYProgress } = useScroll({ target: ref, offset: [...offset] });
  // Ease the progress so fast wheel flicks still darken the words gradually.
  const progress = useSpring(scrollYProgress, { ...spring, restDelta: 0.001 });
  const Tag = as;

  if (reduceMotion) {
    return (
      <Tag ref={ref} className={className}>
        {text}
      </Tag>
    );
  }

  const words = text.split(/\s+/).filter(Boolean);

  return (
    <Tag ref={ref} className={className}>
      {words.map((word, i) => (
        <Word key={i} progress={progress} range={[i / words.length, (i + 1) / words.length]}>
          {word}
        </Word>
      ))}
    </Tag>
  );
}

function Word({
  children,
  progress,
  range,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  // Start each word a little before its slot so neighbours overlap into one smooth wave.
  const start = Math.max(0, range[0] - (range[1] - range[0]) * 2);
  const opacity = useTransform(progress, [start, range[1]], [0.35, 1]);
  // Light gray -> ink, mixed from the theme tokens so a rebrand carries through.
  const inkPercent = useTransform(progress, [start, range[1]], [0, 100]);
  const color = useTransform(inkPercent, (v) => `color-mix(in srgb, var(--color-ink) ${v}%, var(--color-ink-subtle))`);

  return (
    <>
      <motion.span style={{ opacity, color }}>{children}</motion.span>{" "}
    </>
  );
}
