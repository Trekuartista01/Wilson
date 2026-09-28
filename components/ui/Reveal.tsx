"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "li" | "section";
};

/**
 * Fade-in-on-scroll wrapper (Framer Motion + react-intersection-observer).
 * Animates opacity/transform only, so it never causes layout shift.
 * Reduced motion is handled globally by MotionProvider.
 */
export default function Reveal({ children, className, delay = 0, as = "div" }: RevealProps) {
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: "0px 0px -10% 0px" });
  const Component = motion[as];

  return (
    <Component
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </Component>
  );
}
