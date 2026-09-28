import ArrowLink from "./ArrowLink";

type SectionHeaderProps = {
  title: string;
  linkHref?: string;
  linkLabel?: string;
};

/** Section title on the left, "view all" link on the right (stacks on mobile). */
export default function SectionHeader({ title, linkHref, linkLabel }: SectionHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-2 sm:mb-10 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
      <h2 className="text-2xl font-medium tracking-tight sm:text-3xl">{title}</h2>
      {linkHref && linkLabel && <ArrowLink href={linkHref}>{linkLabel}</ArrowLink>}
    </div>
  );
}
