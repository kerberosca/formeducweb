import Link from "next/link";

import { ContactForm } from "@/components/forms/contact-form";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { siteConfig } from "@/lib/site";

export default function ContactPage() {
  return (
    <section className="container py-16 md:py-24">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <SectionHeading
            eyebrow="Contact"
            title="Expliquez-nous votre besoin"
            description="Si vous hésitez entre diagnostic, refonte web ou accompagnement, on vous aidera à choisir la bonne prochaine étape."
          />
          <Card>
            <CardContent className="space-y-4 p-8 text-sm leading-7 text-muted-foreground">
              <p>Réponse habituelle en 1 à 2 jours ouvrables.</p>
              <p>{siteConfig.address}</p>
              <p>{siteConfig.email}</p>
            </CardContent>
          </Card>
          <Button asChild variant="secondary">
            <Link href="/loi-25/wizard">Faire plutôt l’auto-évaluation Loi 25</Link>
          </Button>
        </div>

        <ContactForm />
      </div>
    </section>
  );
}
