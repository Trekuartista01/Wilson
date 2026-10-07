type EyebrowProps = {
  children: React.ReactNode;
  className?: string;
};

/** Small uppercase label above a section heading ("PRONAT", "RRETH WILSON"). Brown by default. */
export default function Eyebrow({ children, className = "text-brand-brown" }: EyebrowProps) {
  return <p className={`text-sm tracking-wide uppercase sm:text-base ${className}`}>{children}</p>;
}
