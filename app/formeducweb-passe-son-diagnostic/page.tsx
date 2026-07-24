import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BrainCircuit, Database, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "ForméducWeb passe son propre diagnostic",
  description:
    "Trois actions de processus vérifiables intégrées par ForméducWeb dans cette relance : IA, cybersécurité et consentement.",
  path: "/formeducweb-passe-son-diagnostic"
});

const actions = [
  {
    icon: BrainCircuit,
    theme: "Intelligence artificielle",
    observation:
      "La production assistée par IA peut avancer plus vite que la vérification des faits et des données.",
    action:
      "Nous avons documenté une liste blanche de sources officielles, interdit toute donnée client et rendu l’approbation humaine obligatoire avant publication.",
    evidence:
      "Le playbook de cette relance impose une première semaine manuelle et bloque toute publication automatisée."
  },
  {
    icon: ShieldCheck,
    theme: "Cybersécurité",
    observation:
      "Un achat groupé crée de nouveaux liens d’accès et de nouveaux cas de répétition de paiement.",
    action:
      "Nous avons lié chaque droit du trio à son acheteur, à un seul diagnostic et à une seule utilisation, puis rendu les événements Stripe idempotents.",
    evidence:
      "Les tests automatisés couvrent le mauvais acheteur, le mauvais sujet, la seconde utilisation, l’expiration et les webhooks répétés."
  },
  {
    icon: Database,
    theme: "Consentement et données",
    observation:
      "Un courriel transactionnel demandé et un courriel commercial ne reposent pas sur le même choix.",
    action:
      "Nous avons séparé les deux parcours, enregistré la source et la date du consentement marketing et ajouté un désabonnement immédiat.",
    evidence:
      "Un retrait de consentement annule aussi les tâches commerciales futures déjà planifiées."
  }
];

export default function SelfDiagnosticCasePage() {
  return (
    <main className="container py-14 md:py-20">
      <div className="mx-auto max-w-5xl">
        <Badge>Preuve interne</Badge>
        <h1 className="mt-6 max-w-4xl font-heading text-4xl font-semibold tracking-tight md:text-6xl">
          ForméducWeb passe son propre diagnostic
        </h1>
        <p className="mt-6 max-w-3xl text-xl leading-9 text-muted-foreground">
          Nous ne publions ni score flatteur ni promesse spectaculaire. Nous
          montrons plutôt trois changements concrets intégrés dans cette relance
          et couverts par des règles ou des tests.
        </p>

        <div className="mt-12 grid gap-6">
          {actions.map((item, index) => (
            <Card key={item.theme}>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <item.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                      Action {index + 1}
                    </p>
                    <CardTitle className="mt-1">{item.theme}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-5 p-6 pt-0 md:grid-cols-3">
                <div>
                  <p className="text-sm font-semibold">Observation</p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {item.observation}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Action appliquée</p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {item.action}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Trace utile</p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {item.evidence}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-10 border-primary/20 bg-primary/5">
          <CardContent className="space-y-4 p-8">
            <h2 className="font-heading text-2xl font-semibold">
              Ce que nous ne publions pas
            </h2>
            <p className="leading-7 text-muted-foreground">
              Nous ne partageons pas les configurations, fournisseurs, comptes,
              fréquences précises, contrôles détaillés ni renseignements
              personnels liés à ces actions. Une preuve utile peut démontrer
              qu’un processus existe sans créer un mode d’emploi pour le
              contourner.
            </p>
          </CardContent>
        </Card>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/intelligence-artificielle/wizard">
              Commencer par le diagnostic IA
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/#diagnostics">Voir les trois diagnostics</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
