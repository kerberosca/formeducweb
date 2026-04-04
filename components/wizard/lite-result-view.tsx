"use client";

import Link from "next/link";
import { useState } from "react";
import { FileText, LockKeyhole, MessageCircle, RotateCcw, ShieldCheck, SquarePen } from "lucide-react";

import { UnlockReportButton } from "@/components/wizard/unlock-report-button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AssessmentPaymentStatus } from "@/lib/assessment-types";
import type { LiteReport } from "@/lib/reportFilters";
import type { LeadCaptureInput } from "@/lib/schemas";
import type { ScoreResult } from "@/lib/scoring";
import { siteConfig } from "@/lib/site";

type LiteResultViewProps = {
  leadCapture: LeadCaptureInput;
  scoreResult: ScoreResult;
  liteReport: LiteReport;
  assessmentId: string;
  accessToken: string;
  paymentStatus: AssessmentPaymentStatus;
  priceLabel: string;
  onEdit?: () => void;
  onRestart?: () => void;
  /** h2 quand la page a déjà un h1 (ex. assistant sur /loi-25/wizard) */
  mainHeadingLevel?: "h1" | "h2";
};

export function LiteResultView({
  leadCapture,
  scoreResult,
  liteReport,
  assessmentId,
  accessToken,
  paymentStatus,
  priceLabel,
  onEdit,
  onRestart,
  mainHeadingLevel = "h1"
}: LiteResultViewProps) {
  const [activeTab, setActiveTab] = useState("lite");
  const isPaid = paymentStatus === "paid";
  const fullReportHref = `/loi-25/rapport/${accessToken}`;
  const MainHeading = mainHeadingLevel;

  const fullReportIncludes = (
    <ul className="space-y-2.5 text-sm leading-6 text-muted-foreground">
      <li>• Top 5 des écarts prioritaires, avec le pourquoi et quoi faire</li>
      <li>• Plan d’action 30 jours + 90 jours adapté à votre profil</li>
      <li>• Rapport PDF téléchargeable (présentation soignée)</li>
      <li>• Checklist de démarrage et gabarits : procédure 1 page, texte type pour formulaire</li>
      <li>• Crédit de {priceLabel} sur un forfait d’implantation si vous poursuivez avec nous</li>
    </ul>
  );

  return (
    <section className="container py-12 md:py-16">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="eyebrow">Résultat gratuit</p>
          <MainHeading className="font-heading text-4xl font-semibold tracking-tight">Votre diagnostic Loi 25</MainHeading>
          <p className="mt-3 max-w-3xl text-lg leading-8 text-muted-foreground">
            Résumé préparé pour {leadCapture.companyName}. Vous obtenez ici un portrait rapide, vos 3 priorités et un
            plan d’action 30 jours pour amorcer la suite.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="secondary">
            <Link href="/contact?source=diagnostic-loi-25">
              <MessageCircle className="mr-2 h-4 w-4" />
              Parler à ForméducWeb
            </Link>
          </Button>
          {onEdit ? (
            <Button type="button" variant="secondary" onClick={onEdit}>
              <SquarePen className="mr-2 h-4 w-4" />
              Modifier mes réponses
            </Button>
          ) : null}
          {onRestart ? (
            <Button type="button" variant="ghost" onClick={onRestart}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Recommencer
            </Button>
          ) : null}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="lite">Résumé (gratuit)</TabsTrigger>
          <TabsTrigger value="full">Rapport complet {isPaid ? "" : "(verrouillé)"}</TabsTrigger>
        </TabsList>

        <TabsContent value="lite" className="space-y-8">
          <Card className="overflow-hidden">
            <CardContent className="grid gap-6 p-8 md:grid-cols-[1fr_auto] md:items-center">
              <div className="space-y-4">
                <Badge>{scoreResult.level.label}</Badge>
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Score global</p>
                  <p className="font-heading text-6xl font-semibold text-primary">{scoreResult.overallScore}/100</p>
                </div>
                <p className="max-w-2xl text-lg leading-8 text-muted-foreground">{scoreResult.level.tagline}</p>
              </div>

              <div className="rounded-[28px] border border-primary/20 bg-primary/5 p-6">
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-primary/70">Ce que vous avez déjà</p>
                <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
                  <li>• Score global et niveau de préparation</li>
                  <li>• 3 priorités concrètes</li>
                  <li>• Plan d’action 30 jours</li>
                  <li>• Disclaimers et prochaines étapes</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <Card>
              <CardHeader>
                <CardTitle>Lecture rapide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-primary/70">Points forts</p>
                  <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
                    {liteReport.summary.highlights.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
                {liteReport.summary.cautions.length ? (
                  <div>
                    <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-primary/70">À surveiller</p>
                    <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
                      {liteReport.summary.cautions.map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vos 3 priorités</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {liteReport.topGaps.map((gap) => (
                  <div key={`${gap.section}-${gap.title}`} className="rounded-2xl border border-border/70 bg-background p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="font-medium">{gap.title}</p>
                      <Badge variant="outline">{gap.priority}</Badge>
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">{gap.action}</p>
                    <p className="mt-3 text-xs uppercase tracking-[0.2em] text-primary/70">{gap.section}</p>
                  </div>
                ))}
                {liteReport.prioritiesContext ? (
                  <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-4">
                    <p className="text-sm leading-6 text-muted-foreground">{liteReport.prioritiesContext}</p>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card>
              <CardHeader>
                <CardTitle>Plan 30 jours</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3 text-sm leading-7 text-muted-foreground">
                  {liteReport.plan30Days.map((item, index) => (
                    <li key={item} className="flex gap-4">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {index + 1}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Et après ?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
                <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-4">
                  <p className="font-medium text-foreground">Plan 90 jours</p>
                  <p>{liteReport.plan90DaysTeaser}</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background p-4">
                  <p className="font-medium text-foreground">Conseil rapide</p>
                  <p>{liteReport.upsellTeaser}</p>
                </div>
                {!isPaid ? (
                  <div className="flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                    <p className="text-sm font-medium text-foreground">Besoin du détail et des gabarits ?</p>
                    <p className="text-sm leading-6 text-muted-foreground">
                      Le rapport complet ({priceLabel}) ajoute le Top 5 détaillé, le plan 90 jours, le PDF et les modèles
                      prêts à réutiliser.
                    </p>
                    <Button type="button" variant="secondary" className="w-full sm:w-fit" onClick={() => setActiveTab("full")}>
                      <FileText className="mr-2 h-4 w-4" />
                      Voir ce que comprend le rapport complet
                    </Button>
                  </div>
                ) : null}
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Auto-évaluation et recommandations générales seulement
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Disclaimers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
              {liteReport.disclaimers.map((item) => (
                <p key={item}>• {item}</p>
              ))}
            </CardContent>
          </Card>

          {!isPaid ? (
            <Card className="overflow-hidden border-primary/25 bg-gradient-to-br from-primary/5 via-background to-background">
              <CardHeader>
                <CardTitle className="flex flex-wrap items-center gap-2 text-2xl">
                  <LockKeyhole className="h-6 w-6 shrink-0 text-primary" aria-hidden />
                  Rapport complet ({priceLabel})
                </CardTitle>
                <p className="text-base font-normal leading-7 text-muted-foreground">
                  Paiement unique, accès immédiat après Stripe. Voici ce que vous obtenez en plus du résumé gratuit :
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {fullReportIncludes}
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  <UnlockReportButton
                    assessmentId={assessmentId}
                    accessToken={accessToken}
                    label={`Débloquer mon rapport complet (${priceLabel})`}
                    className="w-full sm:w-auto sm:min-w-[240px]"
                  />
                  <Button type="button" variant="ghost" className="w-full sm:w-auto" onClick={() => setActiveTab("full")}>
                    FAQ et conditions
                  </Button>
                </div>
                <p className="text-xs leading-5 text-muted-foreground">
                  Pas un avis juridique — outil de diagnostic et de priorisation, comme l’auto-évaluation gratuite.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-primary/20">
              <CardContent className="flex flex-col gap-4 p-8 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">Votre rapport complet est déjà débloqué</p>
                  <p className="text-sm text-muted-foreground">Ouvrez l’onglet « Rapport complet » ou accédez directement au rapport détaillé.</p>
                </div>
                <Button asChild>
                  <Link href={fullReportHref}>Voir mon rapport complet</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="full" className="space-y-6">
          <Card className="overflow-hidden border-primary/20">
            <CardContent className="grid gap-6 p-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <LockKeyhole className="h-3.5 w-3.5" />
                  Rapport complet {isPaid ? "disponible" : "verrouillé"}
                </div>
                <div>
                  <h2 className="font-heading text-3xl font-semibold tracking-tight">
                    Débloquez votre rapport complet ({priceLabel})
                  </h2>
                  <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
                    Paiement unique, accès immédiat et lien sécurisé pour revenir plus tard sur votre rapport complet.
                  </p>
                </div>
                {fullReportIncludes}
              </div>

              <div className="space-y-4 rounded-[28px] border border-border/70 bg-background p-6">
                {isPaid ? (
                  <>
                    <p className="text-sm leading-6 text-muted-foreground">
                      Votre accès complet est déjà activé. Vous pouvez ouvrir votre rapport détaillé et télécharger le PDF.
                    </p>
                    <Button asChild>
                      <Link href={fullReportHref}>Voir mon rapport complet</Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <UnlockReportButton
                      assessmentId={assessmentId}
                      accessToken={accessToken}
                      label={`Débloquer mon rapport complet (${priceLabel})`}
                      className="w-full"
                    />
                    <p className="text-sm text-muted-foreground">Paiement sécurisé Stripe • Accès immédiat • Téléchargement PDF</p>
                  </>
                )}
                <div className="text-sm leading-6 text-muted-foreground">
                  <Link href="/conditions-utilisation" className="underline underline-offset-4">
                    Conditions d’utilisation
                  </Link>{" "}
                  et{" "}
                  <Link href="/politique-confidentialite" className="underline underline-offset-4">
                    politique de confidentialité
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mini FAQ</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                <AccordionItem value="a">
                  <AccordionTrigger>Qu’est-ce qui change entre le gratuit et le complet ?</AccordionTrigger>
                  <AccordionContent>
                    Le gratuit vous donne un portrait utile pour démarrer. Le complet ajoute le Top 5 détaillé, le plan 90 jours,
                    le PDF brandé et les gabarits prêts à utiliser.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="b">
                  <AccordionTrigger>Quand est-ce que j’obtiens l’accès ?</AccordionTrigger>
                  <AccordionContent>
                    Immédiatement après la confirmation du paiement. Vous êtes redirigé vers une page merci avec un lien sécurisé.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="c">
                  <AccordionTrigger>Est-ce que le rapport complet remplace un avis juridique ?</AccordionTrigger>
                  <AccordionContent>
                    Non. Le rapport sert au diagnostic, à l’alignement et à la priorisation. Une validation juridique peut rester
                    pertinente selon votre contexte.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-muted/20">
            <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-medium">Besoin d’un accompagnement humain ?</p>
                <p className="text-sm leading-6 text-muted-foreground">
                  Si vous préférez valider vos priorités avec nous avant de débloquer le rapport, on peut faire un appel rapide.
                </p>
              </div>
              <Button asChild variant="secondary">
                <a href={siteConfig.bookingUrl}>Planifier un appel 20 min</a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
}

