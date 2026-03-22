import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/loi-25/rapport/", "/loi-25/wizard/impression", "/merci"]
      }
    ],
    host: siteUrl,
    sitemap: `${siteUrl}/sitemap.xml`
  };
}
