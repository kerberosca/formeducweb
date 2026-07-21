import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/seo";
import { seoSupportPages } from "@/lib/seo-content";

const indexableRoutes: Array<{
  route: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}> = [
  { route: "", priority: 1, changeFrequency: "weekly" },
  { route: "/hygiene-informatique", priority: 0.97, changeFrequency: "weekly" },
  { route: "/loi-25", priority: 0.95, changeFrequency: "weekly" },
  { route: "/cybersecurite", priority: 0.95, changeFrequency: "weekly" },
  {
    route: "/intelligence-artificielle",
    priority: 0.95,
    changeFrequency: "weekly"
  },
  ...seoSupportPages.map((page) => ({
    route: page.path,
    priority: page.theme === "hygiene" ? 0.86 : 0.82,
    changeFrequency: "monthly" as const
  })),
  { route: "/loi-25/cest-quoi", priority: 0.88, changeFrequency: "monthly" },
  {
    route: "/loi-25/occasion-menage-donnees-cybersecurite",
    priority: 0.84,
    changeFrequency: "monthly"
  },
  { route: "/loi-25/wizard", priority: 0.9, changeFrequency: "weekly" },
  { route: "/cybersecurite/wizard", priority: 0.9, changeFrequency: "weekly" },
  {
    route: "/intelligence-artificielle/wizard",
    priority: 0.9,
    changeFrequency: "weekly"
  },
  { route: "/services", priority: 0.82, changeFrequency: "monthly" },
  { route: "/a-propos", priority: 0.7, changeFrequency: "monthly" },
  { route: "/contact", priority: 0.86, changeFrequency: "monthly" },
  {
    route: "/politique-confidentialite",
    priority: 0.45,
    changeFrequency: "yearly"
  },
  { route: "/politique-cookies", priority: 0.45, changeFrequency: "yearly" },
  { route: "/mentions-legales", priority: 0.35, changeFrequency: "yearly" },
  {
    route: "/conditions-utilisation",
    priority: 0.35,
    changeFrequency: "yearly"
  }
];

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();

  return indexableRoutes.map((entry) => ({
    url: `${siteUrl}${entry.route}`,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority
  }));
}
