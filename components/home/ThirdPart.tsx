"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";
import Reveal from "@/components/ui/Reveal";
import WipeReveal from "@/components/ui/WipeReveal";
import { stepImages } from "./step-images";

type Step = { title: string; text: string };

type ThirdPartProps = {
  eyebrow: string;
  /** Statement lines, alternating bold and light ("LOCAL KNOWLEDGE." / "VERIFIED TITLES."...). */
  lines: string[];
  paragraphs: string[];
  learnMore: { label: string; href: string };
  steps: Step[];
  /** Label template for a missing step image, with {number}. */
  stepImageLabel: string;
};

const pad = (n: number) => String(n).padStart(2, "0");
const EASE = [0.22, 1, 0.36, 1] as const;

// Desktop: the six numbers sit in the three columns of the block above, staggered up and
// down as in the mockup (02 and 05 higher, 04-06 pushed in from the left).
const DESKTOP_PLACE = ["lg:pt-12", "", "lg:pt-12", "lg:ml-[20%] lg:pt-8", "lg:ml-[25%]", "lg:ml-[30%] lg:pt-16"];

/**
 * Homepage "(Why Wilson)" band ("Wilson Home Page4" mockup, 2026-10-06): statement, photo and
 * text on top, the six numbered points below. Clicking a number makes it the active point (it
 * turns yellow) and wipes its photo (step-images.ts) in over the previous one, from below when
 * moving forward and from above when going back. No scroll pinning.
 * Phones: the statement and text come first, then the photo and numbers.
 */
export default function ThirdPart(props: ThirdPartProps) {
  const [active, setActive] = useState(0);
  // The step shown before `active`, kept underneath while the new photo wipes in over it.
  const [previous, setPrevious] = useState<number | null>(null);
  const dir = previous === null || active >= previous ? 1 : -1;

  const pick = (i: number) => {
    if (i === active) return;
    setPrevious(active);
    setActive(i);
  };

  return (
    <section aria-label={props.eyebrow} className="bg-surface-dark text-surface">
      <Container className="pt-16 pb-4 sm:pt-20 lg:hidden">
        <Intro {...props} />
      </Container>

      <Container className="flex flex-col gap-10 pt-6 pb-16 sm:pb-20 lg:gap-16 lg:py-24 xl:px-30">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)_minmax(0,0.75fr)]">
          <Reveal className="hidden flex-col lg:flex">
            <Intro {...props} part="statement" />
          </Reveal>

          {/* Point image: all six stacked, so each is loaded before it is picked. */}
          <WipeReveal
            delay={0.15}
            className="relative aspect-[4/3] w-full self-start rounded-tr-card rounded-bl-card bg-surface/10"
          >
            {props.steps.map((step, i) => {
              const on = i === active;
              const hidden = dir > 0 ? "inset(100% 0% 0% 0%)" : "inset(0% 0% 100% 0%)";
              return (
                <motion.div
                  key={step.title}
                  className="absolute inset-0"
                  style={{ zIndex: on ? 2 : i === previous ? 1 : 0, opacity: on || i === previous ? 1 : 0 }}
                  initial={false}
                  animate={
                    on && previous !== null
                      ? { clipPath: [hidden, "inset(0% 0% 0% 0%)"], scale: [1.12, 1] }
                      : { clipPath: "inset(0% 0% 0% 0%)", scale: 1 }
                  }
                  transition={on ? { duration: 0.75, ease: [0.65, 0, 0.35, 1] } : { duration: 0 }}
                >
                  {stepImages[i] ? (
                    <Image
                      src={stepImages[i]}
                      alt={on ? step.title : ""}
                      aria-hidden={!on}
                      fill
                      sizes="(min-width: 1024px) 30vw, 100vw"
                      placeholder="blur"
                      className="object-cover"
                    />
                  ) : (
                    <ImagePlaceholder
                      aspect="absolute inset-0 h-full"
                      label={props.stepImageLabel.replace("{number}", String(i + 1))}
                    />
                  )}
                </motion.div>
              );
            })}
          </WipeReveal>

          <Reveal delay={0.25} className="hidden lg:block">
            <Intro {...props} part="text" />
          </Reveal>
        </div>

        <ol className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)_minmax(0,0.75fr)] lg:gap-x-10 lg:gap-y-10">
          {props.steps.map((step, i) => {
            const on = i === active;
            return (
              <motion.li
                key={step.title}
                className={DESKTOP_PLACE[i]}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.1 + i * 0.07 }}
              >
                <button
                  type="button"
                  onClick={() => pick(i)}
                  aria-pressed={on}
                  className="group -m-2 block cursor-pointer p-2 text-left"
                >
                  <span
                    className={`block text-[2.6rem] leading-none tracking-tight transition-colors duration-500 sm:text-5xl lg:text-[clamp(3rem,6vw,5.5rem)] ${
                      on ? "text-brand-accent" : "text-surface group-hover:text-brand-accent/70"
                    }`}
                  >
                    {pad(i + 1)}
                  </span>
                  <span
                    className={`mt-2 block text-[0.7rem] tracking-[0.14em] uppercase transition-colors duration-500 sm:text-xs lg:mt-4 ${
                      on ? "text-surface" : "text-surface/70 group-hover:text-surface"
                    }`}
                  >
                    {step.title}
                  </span>
                </button>
              </motion.li>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}

/** Eyebrow + statement and the two paragraphs with "Learn more"; split across columns on desktop. */
function Intro({ eyebrow, lines, paragraphs, learnMore, part }: ThirdPartProps & { part?: "statement" | "text" }) {
  const statement = (
    <>
      <h2 className="font-sans text-sm font-normal text-surface/80 uppercase">{eyebrow}</h2>
      <p className="mt-8 uppercase lg:my-auto">
        {lines.map((line, i) => (
          <span key={line}>
            <span
              className={`block ${
                i % 2 === 0
                  ? "text-xl font-bold sm:text-2xl xl:text-[1.75rem]"
                  : "text-[1.7rem] leading-tight sm:text-3xl xl:text-[2.5rem]"
              }`}
            >
              {line}
            </span>{" "}
          </span>
        ))}
      </p>
    </>
  );
  const text = (
    <div className="mt-8 max-w-sm text-sm leading-relaxed text-surface/85 lg:mt-0">
      {paragraphs.map((p) => (
        <p key={p} className="mb-5">
          {p}
        </p>
      ))}
      <Link
        href={learnMore.href}
        className="inline-flex min-h-11 items-center rounded-tr-btn rounded-bl-btn bg-surface px-5 text-xs tracking-[0.1em] text-ink uppercase transition-colors hover:bg-brand-accent"
      >
        {learnMore.label}
      </Link>
    </div>
  );
  if (part === "statement") return statement;
  if (part === "text") return text;
  return (
    <>
      {statement}
      {text}
    </>
  );
}
