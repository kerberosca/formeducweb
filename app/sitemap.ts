import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/seo";

const indexableRoutes = [
  "",
  "/loi-25",
  "/loi-25/cest-quoi",
  "/loi-25/wizard",
  "/services",
  "/services/site-web",
  "/services/seo",
  "/services/cybersecurite",
  "/a-propos",
  "/contact",
  "/politique-confidentialite",
  "/politique-cookies",
  "/demande-confidentialite",
  "/mentions-legales",
  "/conditions-utilisation"
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const lastModified = new Date();

  return indexableRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified
  }));
}