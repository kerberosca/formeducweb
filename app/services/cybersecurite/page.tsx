import { ServicePageTemplate } from "@/components/marketing/service-page-template";
import { serviceDetails } from "@/lib/content";

export default function CybersecuriteServicePage() {
  return <ServicePageTemplate {...serviceDetails.cybersecurite} />;
}
