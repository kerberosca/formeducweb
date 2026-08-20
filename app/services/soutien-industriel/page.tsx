import type { Metadata } from "next";

import { ServiceDetailPage } from "@/components/portal/service-detail-page";
import { buildPageMetadata } from "@/lib/seo";
import { getServiceBySlug } from "@/lib/services";

const service = getServiceBySlug("soutien-industriel");

export const metadata: Metadata = buildPageMetadata({
  title: service.seoTitle,
  description: service.seoDescription,
  path: service.href
});

export default function IndustrialSupportServicePage() {
  return <ServiceDetailPage service={service} />;
}
