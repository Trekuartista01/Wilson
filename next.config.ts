import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Node-only libraries (raw sockets / TLS): load with Node's require instead of bundling.
  serverExternalPackages: ["nodemailer"],
};

export default nextConfig;
