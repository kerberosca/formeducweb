import type { Metadata } from "next";

import { ServicePageTemplate } from "@/components/marketing/service-page-template";
import { serviceDetails } from "@/lib/content";
import { getAbsoluteUrl } from "@/lib/seo";

const pageDescription =
  "Site web clair, performant et orienté conversion. WordPress ou alternative, formulaires, pages légales et accompagnement.";

export const metadata: Metadata = {
  title: "Création et refonte de site web pour PME",
  description: pageDescription,
  alternates: {
    canonical: getAbsoluteUrl("/services/site-web")
  },
  openGraph: {
    title: "Création et refonte de site web pour PME | ForméducWeb",
    description: pageDescription,
    url: getAbsoluteUrl("/services/site-web")
  }
};

export default function SiteWebServicePage() {
  return <ServicePageTemplate {...serviceDetails["site-web"]} />;
}
