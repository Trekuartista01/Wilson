import Image from "next/image";
import Link from "next/link";
import ImagePlaceholder from "./ImagePlaceholder";

export type CardProps = {
  href: string;
  headline: string;
  subhead: string;
  body?: string;
  tagsTitle?: string;
  tags?: string[];
  buttonLabel: string;
  imageLabel: string;
  /** Photo for the top of the card; without one, the gray placeholder is shown. */
  imageUrl?: string;
  headingLevel?: "h2" | "h3";
};

/**
 * Listing card from the Figma wireframe kit: image, headline, subhead, body,
 * tag row and a button. The whole card is one link.
 */
export default function Card({
  href,
  headline,
  subhead,
  body,
  tagsTitle,
  tags = [],
  buttonLabel,
  imageLabel,
  imageUrl,
  headingLevel = "h3",
}: CardProps) {
  const Heading = headingLevel;
  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-lg bg-surface-card shadow-[0_4px_24px_rgba(0,0,0,0.06)] ring-1 ring-line transition-shadow hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
    >
      {imageUrl ? (
        <div className="relative aspect-[3/2] overflow-hidden bg-placeholder">
          {/* Decorative: the card's heading already names the listing. */}
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
      ) : (
        <ImagePlaceholder aspect="aspect-[3/2]" label={imageLabel} />
      )}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <Heading className="font-sans text-base font-semibold">{headline}</Heading>
        <p className="mt-0.5 text-sm text-ink-muted">{subhead}</p>
        {body && <p className="mt-3 line-clamp-2 text-sm text-ink-muted">{body}</p>}
        {tags.length > 0 && (
          <div className="mt-4 border-t border-divider pt-3">
            {tagsTitle && <p className="text-sm font-medium">{tagsTitle}</p>}
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <li key={tag} className="rounded-full border border-gold px-2.5 py-0.5 text-xs">
                  {tag}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-auto pt-4">
          <span className="inline-flex min-h-9 min-w-24 items-center justify-center rounded bg-brand-brown px-6 text-xs text-surface">
            {buttonLabel}
          </span>
        </div>
      </div>
    </Link>
  );
}
