"use client";

import { useEffect, useState } from "react";
import { animate, useReducedMotion } from "framer-motion";
import { useInView } from "react-intersection-observer";

/**
 * Counts the leading number of `value` up from 0 when it scrolls into view ("25+" runs
 * 0, 1, 2... 25+). Anything after the number is kept as is. The server render and reduced
 * motion show the final value, so it is never wrong without JavaScript.
 */
export default function CountUp({ value, className }: { value: string; className?: string }) {
  const match = /^(\d+)(.*)$/.exec(value);
  const target = match ? Number(match[1]) : 0;
  const suffix = match ? match[2] : "";
  const isNumber = match !== null;
  const reduceMotion = useReducedMotion();
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: "0px 0px -10% 0px" });
  const [shown, setShown] = useState<number | null>(null);

  useEffect(() => {
    if (!isNumber || reduceMotion || !inView || target === 0) return;
    const controls = animate(0, target, {
      duration: Math.min(1.6, 0.6 + target * 0.04),
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setShown(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduceMotion, target, isNumber]);

  return (
    <span ref={ref} className={className}>
      {/* Keeps the final width from the start, so counting never shifts the layout. */}
      <span className="relative inline-block">
        <span className="invisible">{value}</span>
        <span className="absolute inset-0" aria-hidden>
          {isNumber && shown !== null ? `${shown}${suffix}` : value}
        </span>
        <span className="sr-only">{value}</span>
      </span>
    </span>
  );
}
