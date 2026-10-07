import Image from "next/image";
import Link from "next/link";
import logo from "@/public/images/logo.png";

type LogoProps = {
  href: string;
  size?: "sm" | "lg";
  className?: string;
  /** The homepage intro animation flies its logo onto this one (IntroAnimation.tsx). */
  introTarget?: boolean;
};

/**
 * Wilson Real Estate logo (1-01 from the brand materials, cropped: yellow W, white wordmark).
 * Made for dark and gray backgrounds; the white wordmark disappears on white.
 */
export default function Logo({ href, size = "sm", className = "", introTarget = false }: LogoProps) {
  const sizes = {
    sm: "h-6 sm:h-7 lg:h-8",
    lg: "h-10 sm:h-12 lg:h-16",
  };
  return (
    <Link href={href} aria-label="Wilson Real Estate, home" className={`inline-flex min-h-11 items-center ${className}`}>
      <Image
        src={logo}
        alt=""
        priority={size === "sm"}
        sizes={size === "sm" ? "200px" : "400px"}
        data-intro-logo={introTarget || undefined}
        className={`w-auto ${sizes[size]}`}
      />
    </Link>
  );
}
