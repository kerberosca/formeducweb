import type { Metadata } from "next";

import { ServicePageTemplate } from "@/components/marketing/service-page-template";
import { serviceDetails } from "@/lib/content";
import { getAbsoluteUrl } from "@/lib/seo";

const pageDescription =
  "SEO pragmatique: structure, contenu, performance et maillage pour améliorer votre visibilité organique sans promesses irréalistes.";

export const metadata: Metadata = {
  title: "Service SEO pour PME au Québec",
  description: pageDescription,
  alternates: {
    canonical: getAbsoluteUrl("/services/seo")
  },
  openGraph: {
    title: "Service SEO pour PME au Québec | ForméducWeb",
    description: pageDescription,
    url: getAbsoluteUrl("/services/seo")
  }
};

export default function SeoServicePage() {
  return <ServicePageTemplate {...serviceDetails.seo} />;
}
