import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Layers3,
  Network,
  ShieldCheck
} from "lucide-react";

import { SectionHeading } from "@/components/marketing/section-heading";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { diagnosticList } from "@/lib/diagnostics";
import { PRODUCT_CATALOG } from "@/lib/commerce";
import { getReportUnlockPriceLabel } from "@/lib/payments";
import { buildPageMetadata, getAbsoluteUrl } from "@/lib/seo";
import { getWizardData } from "@/lib/wizard";

const description =
  "Produits autonomes ForméducWeb : diagnostics gratuits et Kits d’exécution 90 jours pour la Loi 25, la cybersécurité et l’intelligence artificielle.";

export const metadata: Metadata = buildPageMetadata({
  title: "Produits autonomes et diagnostics",
  description,
  path: "/produits"
});

const iconByType = {
  loi25: ShieldCheck,
  cybersecurity: Network,
  ai: BrainCircuit
};

const indexableProducts = [
  { code: "loi25_kit", path: "/loi-25" },
  { code: "cyber_kit", path: "/cybersecurite" },
  { code: "ai_kit", path: "/intelligence-artificielle" },
  { code: "digital_hygiene_trio", path: "/trio-hygiene-numerique" }
] as const;

export default function ProductsPage() {
  const kitPrice = getReportUnlockPriceLabel();
  const productSchemas = indexableProducts.map(({ code, path }) => {
    const product = PRODUCT_CATALOG[code];

    return {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.description,
      url: getAbsoluteUrl(path),
      brand: {
        "@type": "Brand",
        name: "ForméducWeb"
      },
      offers: {
        "@type": "Offer",
        url: getAbsoluteUrl(path),
        priceCurrency: "CAD",
        price: (product.amountCents / 100).toFixed(2),
        availability: "https://schema.org/InStock"
      }
    };
  });

  return (
    <>
      <JsonLd id="products-schema" value={productSchemas} />
      <section className="container py-16 md:py-24">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-end">
          <div className="space-y-6">
            <Badge variant="secondary">Produits autonomes</Badge>
            <h1 className="max-w-4xl font-heading text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
              Des outils concrets pour avancer à votre rythme.
            </h1>
            <p className="max-w-3xl text-xl leading-9 text-muted-foreground">
              Commencez gratuitement, voyez vos priorités immédiatement, puis
              décidez si un Kit d’exécution vous serait utile. Aucun mandat
              n’est imposé.
            </p>
          </div>
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6 text-sm leading-7 text-muted-foreground">
              <p className="font-semibold text-foreground">
                Les produits ne remplacent pas l’accompagnement.
              </p>
              <p className="mt-2">
                Ils donnent un bon point de départ aux organisations qui
                souhaitent comprendre et agir par elles-mêmes.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container pb-12 md:pb-20">
        <SectionHeading
          eyebrow="Diagnostics et trousses"
          title="Trois sujets, la même démarche simple"
          description={`Chaque diagnostic est gratuit. Le Kit 90 jours complet et ses gabarits restent optionnels à ${kitPrice}.`}
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {diagnosticList.map((diagnostic) => {
            const Icon = iconByType[diagnostic.type];
            const questionCount = getWizardData(diagnostic.type).questions
              .length;

            return (
              <Card key={diagnostic.type} className="flex h-full flex-col">
                <CardHeader className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <Badge variant="secondary">Gratuit pour commencer</Badge>
                  </div>
                  <CardTitle>{diagnostic.label}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-5">
                  <p className="text-sm leading-7 text-muted-foreground">
                    {diagnostic.content.description}
                  </p>
                  <div className="rounded-2xl bg-muted/40 p-4 text-sm text-muted-foreground">
                    {questionCount} questions · environ 10 minutes · résultat
                    immédiat
                  </div>
                  <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
                    {diagnostic.content.freeDeliverables
                      .slice(0, 3)
                      .map((item) => (
                        <li key={item} className="flex gap-2">
                          <CheckCircle2
                            className="mt-1 h-4 w-4 shrink-0 text-primary"
                            aria-hidden="true"
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                  </ul>
                  <div className="mt-auto grid gap-3">
                    <Button asChild>
                      <Link href={diagnostic.wizardPath}>
                        Commencer gratuitement
                      </Link>
                    </Button>
                    <Button asChild variant="secondary">
                      <Link href={diagnostic.path}>Voir tous les détails</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="container py-12 md:py-20">
        <div className="ink-panel overflow-hidden rounded-[36px] p-8 text-white md:p-12">
          <div className="grid gap-8 lg:grid-cols-[auto_1fr_auto] lg:items-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
              <Layers3 className="h-8 w-8 text-[#8dc1ff]" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#8dc1ff]">
                Trio Hygiène numérique
              </p>
              <h2 className="mt-3 font-heading text-3xl font-semibold md:text-4xl">
                Loi 25, cybersécurité et IA dans un seul parcours.
              </h2>
              <p className="mt-3 max-w-3xl leading-7 text-white/75">
                Les trois diagnostics, les trois Kits 90 jours et tous les
                gabarits pour 59 $ CAD. Commencez gratuitement par le sujet qui
                vous semble le plus urgent.
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="bg-white text-[#0d4f9a] hover:bg-white/90"
            >
              <Link href="/trio-hygiene-numerique">
                Voir le trio
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container pb-10 pt-6 md:pb-20">
        <Card className="border-[#fd8417]/25 bg-accent/55">
          <CardContent className="grid gap-6 p-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="font-heading text-2xl font-semibold">
                Vous préférez qu’on regarde la situation avec vous?
              </p>
              <p className="mt-2 text-muted-foreground">
                Nous pouvons évaluer le besoin, comparer les options et vous
                aider seulement là où cela apporte une vraie valeur.
              </p>
            </div>
            <Button asChild variant="secondary">
              <Link href="/contact?source=produits-aide">
                Parler de votre besoin
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
