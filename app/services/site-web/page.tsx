import { ServicePageTemplate } from "@/components/marketing/service-page-template";
import { serviceDetails } from "@/lib/content";

export default function SiteWebServicePage() {
  return <ServicePageTemplate {...serviceDetails["site-web"]} />;
}
