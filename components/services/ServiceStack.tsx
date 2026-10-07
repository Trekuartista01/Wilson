import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import Container from "@/components/ui/Container";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";

type Service = { slug: string; title: string; text: string; image?: StaticImageData };

type ServiceStackProps = {
  services: Service[];
  learnMore: { label: string; href: string };
  imageLabel: string;
};

// Band colours in order ("Sherbimet" mockup, 2026-10-06): yellow, dark gray, near-black, cream.
const TONES = [
  { band: "bg-brand-accent text-ink", accent: "text-ink" },
  { band: "bg-[#2b2b2b] text-surface", accent: "text-brand-accent" },
  { band: "bg-[#1c1c1c] text-surface", accent: "text-brand-accent" },
  { band: "bg-surface-cream text-ink", accent: "text-ink" },
];

/**
 * The four services as full-screen bands that stack: each one sticks under the header and the
 * next scrolls up over it (plain CSS sticky, no scroll script). Bands round the top-right and
 * bottom-left corners, so the one underneath shows at the corners, and cast a soft shadow up
 * onto it. (A shrink on the covered band froze Chrome, so there is none.)
 */
export default function ServiceStack({ services, learnMore, imageLabel }: ServiceStackProps) {
  return (
    <ul>
      {services.map((service, i) => (
        <li key={service.slug} id={service.slug} className="sticky top-(--header-h) scroll-mt-(--header-h)">
          <Band service={service} index={i} learnMore={learnMore} imageLabel={imageLabel} />
        </li>
      ))}
    </ul>
  );
}

function Band({
  service,
  index,
  learnMore,
  imageLabel,
}: {
  service: Service;
  index: number;
  learnMore: ServiceStackProps["learnMore"];
  imageLabel: string;
}) {
  const tone = TONES[index % TONES.length];

  return (
    <div
      className={`flex min-h-[calc(100svh-var(--header-h))] items-center rounded-tr-band rounded-bl-band ${
        index > 0 ? "shadow-[0_-12px_40px_rgba(0,0,0,0.18)]" : ""
      } ${tone.band}`}
    >
      <Container className="grid items-center gap-10 py-14 md:grid-cols-2 md:gap-12 lg:py-20 xl:px-30">
        <div className="flex gap-5 sm:gap-8 lg:pl-6">
          <p className={`w-8 shrink-0 pt-1 text-2xl tabular-nums sm:w-10 sm:text-[1.75rem] ${tone.accent}`}>
            {String(index + 1).padStart(2, "0")}
          </p>
          <div>
            <h2 className={`font-sans text-xl font-bold uppercase sm:text-2xl lg:text-[1.75rem] ${tone.accent}`}>
              {service.title}
            </h2>
            <p className="mt-3 max-w-md opacity-85 sm:text-lg">{service.text}</p>
            {/* No per-service pages yet, so "learn more" leads to the contact form. */}
            <Link
              href={learnMore.href}
              className={`group mt-6 inline-flex min-h-11 items-center gap-3 text-sm ${tone.accent}`}
            >
              {learnMore.label}
              <FiArrowRight aria-hidden className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
        {service.image ? (
          <div className="relative aspect-[3/2] overflow-hidden rounded-tr-card rounded-bl-card bg-placeholder">
            {/* Decorative: the heading beside it names the service. */}
            <Image
              src={service.image}
              alt=""
              fill
              sizes="(min-width: 768px) 45vw, 100vw"
              placeholder="blur"
              className="object-cover"
            />
          </div>
        ) : (
          <ImagePlaceholder aspect="aspect-[3/2] rounded-tr-card rounded-bl-card" label={imageLabel} />
        )}
      </Container>
    </div>
  );
}
