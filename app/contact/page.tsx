import type { Metadata } from "next";
import Link from "next/link";

import { ContactForm } from "@/components/forms/contact-form";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getAbsoluteUrl } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

const pageDescription =
  "Parlez-nous de votre projet: diagnostic Loi 25, cybersécurité, IA ou accompagnement numérique pour PME au Québec.";

export const metadata: Metadata = {
  title: {
    absolute: "Contact ForméducWeb | Loi 25, cybersécurité et IA"
  },
  description: pageDescription,
  alternates: {
    canonical: getAbsoluteUrl("/contact")
  },
  openGraph: {
    title: "Contact ForméducWeb | Loi 25, cybersécurité et IA",
    description: pageDescription,
    url: getAbsoluteUrl("/contact")
  }
};

export default function ContactPage() {
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

        <ContactForm />
      </div>
    </section>
  );
}
