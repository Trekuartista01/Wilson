import type { MetadataRoute } from "next";

// The admin panel and the API are not for search engines. (The admin pages also send
// noindex themselves; this keeps crawlers from requesting them at all.)
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api"] }],
  };
}
