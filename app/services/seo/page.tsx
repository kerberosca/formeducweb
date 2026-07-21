import { permanentRedirect } from "next/navigation";

export default function LegacySeoServicePage() {
  permanentRedirect("/services");
}
