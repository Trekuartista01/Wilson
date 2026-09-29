"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { FiArrowDown } from "react-icons/fi";
import Container from "@/components/ui/Container";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";
import ScrollWords from "@/components/ui/ScrollWords";

type Step = { title: string; text: string };

type FourthPartProps = {
  statement: string;
  steps: Step[];
  /** Label template for the step image placeholder, with {number}. */
  stepImageLabel: string;
};

// Scroll distance per step, in viewport heights. Lower = faster step changes.
const SCROLL_PER_STEP_SVH = 60;

/**
 * Homepage section 4: the six-step process (Figma "Body" bottom + "Scroll").
 *
 * The section pins to the viewport while the visitor scrolls through it. Scroll progress
 * picks the active step, and the numbered timeline slides up so the active step is always
 * at the top of the column; the image on the right swaps per step.
 * With prefers-reduced-motion the section renders as a plain static list instead.
 */
export default function FourthPart({ statement, steps, stepImageLabel }: FourthPartProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section className="pt-12 sm:pt-16 lg:pt-24">
      <Container>
        <ScrollWords
          text={statement}
          className="max-w-3xl text-3xl leading-tight font-light tracking-tight text-balance sm:text-4xl lg:text-5xl"
        />
      </Container>
      {reduceMotion ? (
        <StaticSteps steps={steps} stepImageLabel={stepImageLabel} />
      ) : (
        <PinnedSteps steps={steps} stepImageLabel={stepImageLabel} />
      )}
    </section>
  );
}

function stepLabel(template: string, index: number) {
  return template.replace("{number}", String(index + 1));
}

function PinnedSteps({ steps, stepImageLabel }: Omit<FourthPartProps, "statement">) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const next = Math.min(steps.length - 1, Math.max(0, Math.floor(progress * steps.length)));
    setActive(next);
  });

  return (
    <div ref={ref} className="relative" style={{ height: `${100 + steps.length * SCROLL_PER_STEP_SVH}svh` }}>
      <div className="sticky top-(--header-h) h-[calc(100svh-var(--header-h))] overflow-hidden">
        <Container className="flex h-full flex-col gap-6 py-6 sm:py-10 lg:grid lg:grid-cols-2 lg:gap-16 lg:py-16">
          {/* Step image (top on mobile, right column on desktop) */}
          <div className="relative shrink-0 lg:order-2 lg:h-full">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <ImagePlaceholder
                  aspect="aspect-video max-h-[30svh] sm:max-h-[36svh] lg:aspect-auto lg:h-full lg:max-h-none"
                  label={stepLabel(stepImageLabel, active)}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Timeline window: the list slides so the active step sits at the top. */}
          <div className="relative min-h-0 flex-1 overflow-hidden [mask-image:linear-gradient(to_bottom,black_65%,transparent)] lg:order-1 lg:pt-8 lg:pl-8 xl:pl-16">
            <motion.ol
              animate={{ y: `${(-active * 100) / steps.length}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 22 }}
            >
              {steps.map((step, i) => (
                <StepItem
                  key={step.title}
                  step={step}
                  index={i}
                  state={i === active ? "active" : i < active ? "done" : "upcoming"}
                  isLast={i === steps.length - 1}
                />
              ))}
            </motion.ol>
          </div>
        </Container>
      </div>
    </div>
  );
}

function StepItem({
  step,
  index,
  state,
  isLast,
}: {
  step: Step;
  index: number;
  state: "active" | "done" | "upcoming";
  isLast: boolean;
}) {
  const active = state === "active";
  return (
    <li aria-current={active ? "step" : undefined} className="relative flex h-40 gap-4 sm:h-48 sm:gap-5 lg:h-56">
      {/* Connector line to the next step */}
      <span
        aria-hidden
        className={`absolute top-12 bottom-0 left-6 w-px -translate-x-1/2 transition-colors duration-500 ${
          state === "upcoming" ? "bg-line" : "bg-ink"
        }`}
      />
      {isLast && <FiArrowDown aria-hidden className="absolute bottom-0 left-6 size-3 -translate-x-1/2 text-ink-subtle" />}
      <motion.span
        animate={{ scale: active ? 1 : 0.85 }}
        className={`relative z-10 inline-flex size-12 shrink-0 items-center justify-center rounded-full text-xl font-semibold transition-colors duration-500 ${
          active ? "bg-brand-accent text-ink" : "bg-ink-subtle/60 text-surface"
        }`}
      >
        {index + 1}
      </motion.span>
      <div className={`pt-1 transition-opacity duration-500 ${active ? "opacity-100" : "opacity-40"}`}>
        <h3 className="text-lg font-semibold tracking-tight sm:text-xl">{step.title}</h3>
        <p className="mt-1 max-w-sm text-sm text-ink-muted sm:text-base">{step.text}</p>
      </div>
    </li>
  );
}

function StaticSteps({ steps, stepImageLabel }: Omit<FourthPartProps, "statement">) {
  return (
    <Container className="grid gap-10 py-12 lg:grid-cols-2 lg:gap-16 lg:py-16">
      <ol className="space-y-8">
        {steps.map((step, i) => (
          <li key={step.title} className="flex gap-5">
            <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-accent text-xl font-semibold text-ink">
              {i + 1}
            </span>
            <div className="pt-1">
              <h3 className="text-lg font-semibold sm:text-xl">{step.title}</h3>
              <p className="mt-1 text-sm text-ink-muted sm:text-base">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <ImagePlaceholder aspect="aspect-[4/5]" label={stepLabel(stepImageLabel, 0)} />
    </Container>
  );
}
