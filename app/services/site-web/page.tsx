import { permanentRedirect } from "next/navigation";

export default function LegacyWebsiteServicePage() {
  permanentRedirect("/services");
}
