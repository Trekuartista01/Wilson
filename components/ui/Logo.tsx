import Link from "next/link";

type LogoProps = {
  href: string;
  size?: "sm" | "lg";
  className?: string;
};

/** TODO: brand logo. Text placeholder until the logo file is delivered. */
export default function Logo({ href, size = "sm", className = "" }: LogoProps) {
  const sizes = {
    sm: "text-xl sm:text-2xl",
    lg: "text-4xl sm:text-5xl lg:text-6xl",
  };
  return (
    <Link
      href={href}
      aria-label="Wilson Real Estate, home"
      className={`inline-flex min-h-11 items-center font-bold tracking-tight ${sizes[size]} ${className}`}
    >
      LOGO
    </Link>
  );
}
