import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const routes = [
  "",
  "/loi-25",
  "/loi-25/wizard",
  "/services",
  "/services/site-web",
  "/services/seo",
  "/services/cybersecurite",
  "/a-propos",
  "/contact",
  "/politique-confidentialite",
  "/demande-confidentialite",
  "/mentions-legales",
  "/conditions-utilisation",
  "/merci"
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date()
  }));
}

