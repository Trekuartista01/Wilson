"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";

type ScrollWordsProps = {
  text: string;
  className?: string;
  as?: "h2" | "p";
};

/**
 * Scroll-linked word reveal: each word fades and rises into place in turn as the text
 * scrolls up through the viewport, and reverses when scrolling back.
 * Transforms only, so no layout shift. Reduced motion renders the plain text.
 */
export default function ScrollWords({ text, className, as = "h2" }: ScrollWordsProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const reduceMotion = useReducedMotion();
  // 0 when the top of the text enters the lower part of the screen, 1 when its bottom passes the middle.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "end 0.5"] });
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
        <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
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
  const start = Math.max(0, range[0] - (range[1] - range[0]) * 1.5);
  const opacity = useTransform(progress, [start, range[1]], [0.12, 1]);
  const y = useTransform(progress, [start, range[1]], ["0.4em", "0em"]);
  const filter = useTransform(progress, [start, range[1]], ["blur(6px)", "blur(0px)"]);

  return (
    <>
      <motion.span className="inline-block will-change-transform" style={{ opacity, y, filter }}>
        {children}
      </motion.span>{" "}
    </>
  );
}
