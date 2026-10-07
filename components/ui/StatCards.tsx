import Link from "next/link";
import { FiArrowUpRight, FiCheck, FiTarget } from "react-icons/fi";
import CountUp from "@/components/ui/CountUp";
import Reveal from "@/components/ui/Reveal";

const statIcons = [FiArrowUpRight, FiTarget, FiCheck];

type StatCardsProps = {
  stats: { value: string; label: string }[];
  /** Where the first card goes (the listings). */
  href: string;
  /** "View properties", read out with the first card. */
  linkLabel: string;
  className?: string;
};

/**
 * The three stat cards ("25+ / 6 / 0") on the homepage "About Wilson" teaser and the About
 * page: the middle one yellow, the numbers counting up as they come in, every card rounded
 * top-right and bottom-left ("Wilson Home Page4" mockup). The first card links to the listings.
 */
export default function StatCards({ stats, href, linkLabel, className = "" }: StatCardsProps) {
  return (
    <ul className={`grid gap-4 sm:grid-cols-3 sm:gap-5 ${className}`}>
      {stats.map((stat, i) => {
        const Icon = statIcons[i] ?? FiCheck;
        const card = (
          <>
            <span
              aria-hidden
              className="absolute top-5 right-5 inline-flex size-10 items-center justify-center rounded-full bg-surface text-ink transition-transform group-hover:rotate-45 lg:top-6 lg:right-7"
            >
              <Icon className="size-4" />
            </span>
            <CountUp value={stat.value} className="block text-6xl leading-none tracking-tight lg:text-7xl" />
            <span className="mt-3 block max-w-[18rem] text-xs leading-snug tracking-[0.12em] uppercase sm:text-[0.8rem]">
              {stat.label}
            </span>
          </>
        );
        const box = `relative flex h-full min-h-48 flex-col justify-end rounded-tr-card rounded-bl-card p-6 lg:aspect-[3/2] lg:min-h-0 lg:px-7 lg:pb-7 ${
          i === 1 ? "bg-brand-accent" : "bg-surface-sand"
        }`;
        return (
          <Reveal as="li" key={stat.label} delay={i * 0.08}>
            {i === 0 ? (
              <Link
                href={href}
                aria-label={`${stat.value} ${stat.label}. ${linkLabel}`}
                className={`${box} group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink`}
              >
                {card}
              </Link>
            ) : (
              <div className={box}>{card}</div>
            )}
          </Reveal>
        );
      })}
    </ul>
  );
}
