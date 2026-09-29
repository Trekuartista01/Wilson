import type { NextConfig } from "next";

// Listing photos are served from this project's Supabase Storage bucket. Required: without
// it, next/image would refuse every listing photo.
if (!process.env.SUPABASE_URL) {
  throw new Error("Missing required environment variable: SUPABASE_URL (see .env.example)");
}
const supabase = new URL(process.env.SUPABASE_URL);

// Security headers on every response.
const securityHeaders = [
  // Only this site may put its pages in a frame (blocks clickjacking, e.g. of the admin).
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'; base-uri 'self'; form-action 'self'; object-src 'none'" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" }, // same, for older browsers
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  // HTTPS only for two years once visited over HTTPS (ignored on http://localhost).
  { key: "Strict-Transport-Security", value: "max-age=63072000" },
];

const nextConfig: NextConfig = {
  // Don't advertise the framework.
  poweredByHeader: false,
  // Node-only libraries (raw sockets / TLS): load with Node's require instead of bundling.
  serverExternalPackages: ["nodemailer"],
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  images: {
    // Only the public listing-photos bucket of this project, nothing else on that host.
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabase.hostname,
        pathname: "/storage/v1/object/public/property-images/**",
      },
    ],
  },
};

export default nextConfig;
