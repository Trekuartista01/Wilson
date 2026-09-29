"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FiArrowUp } from "react-icons/fi";

/** Floating "back to top" button, shown after the visitor scrolls down. */
export default function ScrollToTop({ label }: { label: string }) {
  const [visible, setVisible] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          aria-label={label}
          onClick={() => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" })}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          className="fixed right-4 bottom-4 z-40 inline-flex size-12 items-center justify-center rounded-full bg-brand-accent text-ink shadow-lg transition-colors hover:bg-ink hover:text-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary sm:right-6 sm:bottom-6"
        >
          <FiArrowUp aria-hidden className="size-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
