import type { MetadataRoute } from "next";

import { db } from "@/lib/db";
import { getSiteUrl } from "@/lib/seo";
import { seoSupportPages } from "@/lib/seo-content";
import { services } from "@/lib/services";

export const dynamic = "force-dynamic";

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
  { route: "/formations", priority: 0.96, changeFrequency: "weekly" },
  { route: "/services", priority: 0.94, changeFrequency: "monthly" },
  ...services.map((service) => ({
    route: service.href,
    priority: 0.86,
    changeFrequency: "monthly" as const
  })),
  { route: "/produits", priority: 0.9, changeFrequency: "weekly" },
  {
    route: "/trio-hygiene-numerique",
    priority: 0.86,
    changeFrequency: "weekly"
  },
  { route: "/ressources", priority: 0.82, changeFrequency: "weekly" },
  { route: "/realisations", priority: 0.76, changeFrequency: "monthly" },
  {
    route: "/realisations/escadron-839",
    priority: 0.72,
    changeFrequency: "monthly"
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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const courses = await db.course.findMany({
    where: {
      status: { in: ["published", "preparation"] },
      archivedAt: null
    },
    orderBy: [{ featured: "desc" }, { title: "asc" }],
    select: { slug: true, featured: true }
  });
  const courseRoutes = courses.map((course) => ({
    route: `/formations/${course.slug}`,
    priority: course.featured ? 0.9 : 0.82,
    changeFrequency: "monthly" as const
  }));

  return [...indexableRoutes, ...courseRoutes].map((entry) => ({
    url: `${siteUrl}${entry.route}`,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority
  }));
}
