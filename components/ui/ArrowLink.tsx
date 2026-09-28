import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

type ArrowLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

/** Text link with a trailing arrow ("Shiko të gjitha pronat →"). */
export default function ArrowLink({ href, children, className = "" }: ArrowLinkProps) {
  return (
    <Link
      href={href}
      className={`group inline-flex min-h-11 items-center gap-2 text-sm font-medium sm:text-base ${className}`}
    >
      <span className="underline-offset-4 group-hover:underline">{children}</span>
      <FiArrowRight aria-hidden className="shrink-0 transition-transform group-hover:translate-x-1" />
    </Link>
  );
}
