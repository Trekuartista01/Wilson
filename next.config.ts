import type { NextConfig } from "next";

// Listing photos are served from this project's Supabase Storage bucket. Required: without
// it, next/image would refuse every listing photo.
if (!process.env.SUPABASE_URL) {
  throw new Error("Missing required environment variable: SUPABASE_URL (see .env.example)");
}
const supabase = new URL(process.env.SUPABASE_URL);

const nextConfig: NextConfig = {
  // Node-only libraries (raw sockets / TLS): load with Node's require instead of bundling.
  serverExternalPackages: ["nodemailer"],
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
