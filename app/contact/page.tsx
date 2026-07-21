import type { Metadata } from "next";
import Link from "next/link";

import { ContactForm } from "@/components/forms/contact-form";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { buildPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

const pageDescription =
  "Parlez-nous de votre projet: diagnostic Loi 25, cybersécurité, IA ou accompagnement numérique pour PME au Québec.";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact ForméducWeb | Loi 25, cybersécurité et IA",
  description: pageDescription,
  path: "/contact"
});

type ContactPageProps = {
  searchParams?:
    | Promise<{ source?: string | string[] }>
    | { source?: string | string[] };
};

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const rawSearchParams = await Promise.resolve(searchParams ?? {});
  const source = Array.isArray(rawSearchParams.source)
    ? rawSearchParams.source[0]
    : rawSearchParams.source;
  const defaultReason = source?.includes("loi25")
    ? "Diagnostic Loi 25"
    : source?.includes("cybersecurite")
      ? "Diagnostic cybersécurité"
      : source?.includes("diagnostic-ia")
        ? "Diagnostic IA en entreprise"
        : source?.includes("appel")
          ? "Accompagnement / implantation"
          : undefined;

  return (
    <section className="container py-16 md:py-24">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <SectionHeading
            eyebrow="Contact"
            title="Expliquez-nous votre besoin"
            description="Si vous hésitez entre Loi 25, cybersécurité, IA ou accompagnement, on vous aidera à choisir la bonne prochaine étape."
            titleLevel="h1"
          />
          <Card>
            <CardContent className="space-y-4 p-8 text-sm leading-7 text-muted-foreground">
              <p>Réponse habituelle en 1 à 2 jours ouvrables.</p>
              <p>{siteConfig.address}</p>
              <p>{siteConfig.email}</p>
            </CardContent>
          </Card>
          <Button asChild variant="secondary">
            <Link href="/#diagnostics">Faire plutôt une auto-évaluation</Link>
          </Button>
        </div>

        <ContactForm defaultReason={defaultReason} />
      </div>
    </section>
  );
}
