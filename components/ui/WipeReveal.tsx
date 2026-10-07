"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

type WipeRevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Where the wipe starts: "left" uncovers left to right, "bottom" bottom to top. */
  from?: "left" | "bottom";
  delay?: number;
  duration?: number;
};

const HIDDEN = {
  left: "inset(0% 100% 0% 0%)",
  bottom: "inset(100% 0% 0% 0%)",
};

/**
 * Scroll-in entrance for photos and boxes: the content is uncovered by a wipe (clip-path, so
 * no layout shift) with a slight zoom settling, once, when it first scrolls into view. Pairs
 * with Reveal (fade-up) for text. Reduced motion: MotionProvider skips the zoom, and the
 * wipe still finishes instantly enough not to matter.
 */
export default function WipeReveal({ children, className, from = "bottom", delay = 0, duration = 1 }: WipeRevealProps) {
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: "0px 0px -12% 0px" });

  return (
    <motion.div
      ref={ref}
      className={`overflow-hidden ${className ?? ""}`}
      initial={{ clipPath: HIDDEN[from] }}
      animate={inView ? { clipPath: "inset(0% 0% 0% 0%)" } : undefined}
      transition={{ duration, ease: [0.65, 0, 0.35, 1], delay }}
    >
      <motion.div
        className="relative size-full"
        initial={{ scale: 1.15 }}
        animate={inView ? { scale: 1 } : undefined}
        transition={{ duration: duration + 0.4, ease: [0.22, 1, 0.36, 1], delay }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
