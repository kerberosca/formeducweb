import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { CtaBand } from "@/components/marketing/cta-band";
import { FaqList } from "@/components/marketing/faq-list";
import { SectionHeading } from "@/components/marketing/section-heading";
import { ServiceCard } from "@/components/marketing/service-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { homeFaq, homeHighlights, homeHowItWorks, trustSignals } from "@/lib/content";

export default function HomePage() {
  return (
    <>
      <section className="container py-16 md:py-24">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-7">
            <Badge variant="secondary">Basé au Québec</Badge>
            <div className="space-y-5">
              <h1 className="font-heading text-5xl font-semibold tracking-tight md:text-7xl">
                Mettez votre entreprise en ordre (Loi 25) — simplement.
              </h1>
              <p className="max-w-2xl text-xl leading-9 text-muted-foreground">
                ForméducWeb aide les PME et OBNL à voir clair, prioriser et implanter des actions concrètes sur leur
                site web, leurs formulaires et leurs pratiques de base.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/loi-25/wizard">Faire mon auto-évaluation Loi 25</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/contact">Parler à ForméducWeb</Link>
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {trustSignals.map((signal) => (
                <div key={signal.label} className="flex items-center gap-3 rounded-2xl border border-border/70 bg-white/70 p-4">
                  <signal.icon className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">{signal.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-grid relative overflow-hidden rounded-[40px] border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(245,245,239,0.92))] p-8 shadow-halo">
            <div className="absolute right-6 top-6 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              Auto-évaluation gratuite
            </div>
            <div className="space-y-6">
              <p className="eyebrow">Diagnostic guidé</p>
              <h2 className="font-heading text-3xl font-semibold tracking-tight">Un rapport lisible, pas un jargon illisible</h2>
              <div className="grid gap-4">
                {[
                  "Score global normalisé sur 100",
                  "Priorités par section B à F",
                  "Plan d’action 30 / 90 jours",
                  "Version imprimable pour discussion interne"
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-white/80 px-4 py-4">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm leading-7 text-muted-foreground">
                L’outil produit un diagnostic et un plan d’alignement. Il ne constitue pas un avis juridique.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-10 md:py-14">
        <SectionHeading
          eyebrow="Services"
          title="Trois façons de vous aider à avancer"
          description="On intervient là où le web, la conformité opérationnelle et l’implantation se rencontrent."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {homeHighlights.map((item) => (
            <ServiceCard key={item.title} title={item.title} description={item.description} href={item.href} icon={item.icon} />
          ))}
        </div>
      </section>

      <section className="container py-12 md:py-20">
        <SectionHeading
          eyebrow="Comment ça marche"
          title="Un parcours simple en 3 étapes"
          description="Pas besoin d’avoir déjà tout documenté pour commencer."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {homeHowItWorks.map((item, index) => (
            <Card key={item.title}>
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                  {index + 1}
                </div>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-7 text-muted-foreground">{item.description}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <CtaBand
        title="Commencez par voir où vous en êtes réellement"
        description="Le diagnostic est conçu pour vous donner une lecture claire de votre situation actuelle et des prochaines actions les plus rentables."
      />

      <section className="container py-12 md:py-20">
        <SectionHeading
          eyebrow="FAQ"
          title="Questions fréquentes"
          description="Quelques réponses rapides avant de commencer."
        />
        <div className="mt-8 rounded-[32px] border border-border/70 bg-white/80 p-6 md:p-8">
          <FaqList items={homeFaq} />
        </div>
        <div className="mt-8">
          <Button asChild variant="link">
            <Link href="/loi-25">
              En savoir plus sur le service Loi 25
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}

