type ImagePlaceholderProps = {
  /** Tailwind aspect class, e.g. "aspect-[3/2]". Fixed ratio prevents layout shift. */
  aspect?: string;
  label?: string;
  className?: string;
  tone?: "light" | "dark";
};

/**
 * Gray box standing in for a photo (no stock images in Phase 1).
 * TODO: replace with next/image + proper `sizes` once Supabase Storage images exist.
 */
export default function ImagePlaceholder({
  aspect = "aspect-[3/2]",
  label,
  className = "",
  tone = "light",
}: ImagePlaceholderProps) {
  const tones = {
    light: "bg-placeholder text-ink-subtle",
    dark: "bg-brand-secondary text-surface/70",
  };
  return (
    <div
      role="img"
      aria-label={label}
      className={`flex w-full items-center justify-center overflow-hidden ${aspect} ${tones[tone]} ${className}`}
    >
      {label && <span className="px-3 text-center text-xs uppercase tracking-widest">{label}</span>}
    </div>
  );
}
