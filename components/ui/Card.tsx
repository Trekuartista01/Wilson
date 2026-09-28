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
  headingLevel = "h3",
}: CardProps) {
  const Heading = headingLevel;
  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-lg bg-surface shadow-[0_4px_24px_rgba(0,0,0,0.06)] ring-1 ring-line transition-shadow hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
    >
      <ImagePlaceholder aspect="aspect-[3/2]" label={imageLabel} />
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <Heading className="text-base font-semibold">{headline}</Heading>
        <p className="mt-0.5 text-sm text-ink-muted">{subhead}</p>
        {body && <p className="mt-3 line-clamp-2 text-sm text-ink-muted">{body}</p>}
        {tags.length > 0 && (
          <div className="mt-4 border-t border-line pt-3">
            {tagsTitle && <p className="text-sm font-medium">{tagsTitle}</p>}
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <li key={tag} className="rounded-full border border-ink/40 px-2.5 py-0.5 text-xs">
                  {tag}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-auto pt-4">
          <span className="inline-flex min-h-9 items-center rounded-md bg-brand-primary px-3 text-xs text-surface group-hover:bg-black">
            {buttonLabel}
          </span>
        </div>
      </div>
    </Link>
  );
}
