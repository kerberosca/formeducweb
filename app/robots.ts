import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/loi-25/rapport/",
          "/cybersecurite/rapport/",
          "/intelligence-artificielle/rapport/",
          "/loi-25/wizard/impression",
          "/formations/*/apprendre",
          "/mon-espace",
          "/mon-espace/",
          "/administration",
          "/administration/",
          "/connexion",
          "/certificats/verifier/",
          "/merci"
        ]
      }
    ],
    host: siteUrl,
    sitemap: `${siteUrl}/sitemap.xml`
  };
}
