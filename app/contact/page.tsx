import type { Metadata } from "next";
import Link from "next/link";

import { ContactForm } from "@/components/forms/contact-form";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getContactReasonFromSource } from "@/lib/contact-options";
import { buildPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

const pageDescription =
  "Parlez-nous de votre projet Web, de formation, d’automatisation ou de soutien informatique. ForméducWeb vous aide à choisir une prochaine étape réaliste.";

export const metadata: Metadata = buildPageMetadata({
  title: "Parler de votre besoin numérique",
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
  const defaultReason = getContactReasonFromSource(source);

  return (
    <section className="container py-16 md:py-24">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <SectionHeading
            eyebrow="Contact"
            title="Commençons par votre besoin, pas par un outil"
            description="Expliquez-nous ce que vous voulez améliorer. Nous regarderons avec vous les options, les coûts et ce que votre équipe peut garder en main."
            titleLevel="h1"
          />
          <Card>
            <CardContent className="space-y-4 p-8 text-sm leading-7 text-muted-foreground">
              <p className="font-semibold text-foreground">
                Une première discussion simple et sans pression.
              </p>
              <p>Réponse habituelle en 1 à 2 jours ouvrables.</p>
              <p>
                Site Web, automatisation, formation, soutien TI ou besoin
                spécialisé : si la solution n’existe pas encore, nous pouvons la
                définir avec vous.
              </p>
              <p>{siteConfig.address}</p>
              <p>{siteConfig.email}</p>
            </CardContent>
          </Card>
          <Button asChild variant="secondary">
            <Link href="/formations">Explorer plutôt les formations</Link>
          </Button>
        </div>

        <ContactForm defaultReason={defaultReason} />
      </div>
    </section>
  );
}
