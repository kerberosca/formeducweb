"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";
import { Printer, RotateCcw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { readAssessmentReport } from "@/lib/report-print";

function subscribe() {
  return () => undefined;
}

function getClientReadySnapshot() {
  return true;
}

function getServerReadySnapshot() {
  return false;
}

function getClientReportSnapshot() {
  return readAssessmentReport();
}

function getServerReportSnapshot() {
  return null;
}

export function PrintReportPage() {
  const ready = useSyncExternalStore(subscribe, getClientReadySnapshot, getServerReadySnapshot);
  const payload = useSyncExternalStore(subscribe, getClientReportSnapshot, getServerReportSnapshot);

  useEffect(() => {
    if (!payload) return;

    const timeout = window.setTimeout(() => {
      window.print();
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [payload]);

  if (ready && !payload) {
    return (
      <section className="container py-16 md:py-24">
        <Card className="mx-auto max-w-3xl">
          <CardContent className="space-y-6 p-10 text-center">
            <p className="eyebrow">Impression PDF</p>
            <h1 className="font-heading text-4xl font-semibold tracking-tight">Aucun rapport à imprimer</h1>
            <p className="text-lg leading-8 text-muted-foreground">
              Retournez à l’assistant, générez le rapport puis réessayez le bouton Télécharger PDF.
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/loi-25/wizard">Retour à l’assistant</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (!payload) {
    return null;
  }

  const { wizard, leadCapture, scoreResult, report, savedAt } = payload;

  return (
    <section className="print-page-shell container py-10 md:py-16">
      <div className="print-hidden mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="eyebrow">Impression PDF</p>
          <h1 className="font-heading text-4xl font-semibold tracking-tight">Version optimisée pour impression</h1>
          <p className="mt-3 max-w-2xl text-lg leading-8 text-muted-foreground">
            Cette page ouvre une version plus stable du rapport pour Enregistrer en PDF.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="button" variant="secondary" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimer / Enregistrer en PDF
          </Button>
          <Button asChild variant="secondary">
            <Link href="/loi-25/wizard">Retour au rapport</Link>
          </Button>
        </div>
      </div>

      <article className="report-print-root space-y-6">
        <header className="report-avoid-break rounded-[28px] border border-border/70 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
          <p className="report-print-eyebrow">Rapport d’auto-évaluation Loi 25</p>
          <h1 className="font-heading text-4xl font-semibold tracking-tight">Votre diagnostic Loi 25</h1>
          <div className="mt-4 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
            <p>Entreprise: {leadCapture.companyName}</p>
            <p>Contact: {leadCapture.contactName}</p>
            <p>Courriel: {leadCapture.email}</p>
            <p>Rapport préparé le: {new Date(savedAt).toLocaleString("fr-CA")}</p>
          </div>
        </header>

        <Card className="report-avoid-break overflow-hidden">
          <CardContent className="report-summary-grid grid gap-6 p-8 md:grid-cols-[1fr_auto] md:items-center">
            <div className="space-y-4">
              <Badge>{scoreResult.level.label}</Badge>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Score global</p>
                <p className="font-heading text-6xl font-semibold text-primary">{scoreResult.overallScore}/100</p>
              </div>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">{scoreResult.level.tagline}</p>
              <p className="text-sm leading-6 text-muted-foreground">{wizard.disclaimer}</p>
            </div>
          </CardContent>
        </Card>

        <div className="report-stack-grid grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="report-avoid-break">
            <CardHeader>
              <CardTitle>Notes et lecture rapide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-primary/70">Points forts</p>
                <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
                  {report.summary.highlights.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-primary/70">À surveiller</p>
                <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
                  {report.summary.cautions.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
              {scoreResult.notes.length ? (
                <div>
                  <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-primary/70">Notes</p>
                  <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
                    {scoreResult.notes.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="report-avoid-break">
            <CardHeader>
              <CardTitle>Scores par section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {scoreResult.sectionScores.map((section) => (
                <div
                  key={section.sectionId}
                  className="grid gap-2 rounded-2xl border border-border/70 bg-background px-4 py-4 md:grid-cols-[1fr_auto]"
                >
                  <div>
                    <p className="font-medium">{section.sectionTitle}</p>
                    <p className="text-sm text-muted-foreground">Section {section.sectionId}</p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-xl font-semibold text-primary">{section.percent}%</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Niveau</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="report-avoid-break">
          <CardHeader>
            <CardTitle>Écarts prioritaires</CardTitle>
          </CardHeader>
          <CardContent className="report-gaps-grid grid gap-4 md:grid-cols-2">
            {report.topGaps.map((gap) => (
              <div
                key={`${gap.section}-${gap.title}`}
                className="report-avoid-break rounded-[24px] border border-border/70 bg-background p-5"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="font-medium">{gap.title}</p>
                  <Badge variant="outline">{gap.priority}</Badge>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">{gap.whyItMatters}</p>
                <p className="mt-3 text-sm leading-6 text-foreground">{gap.action}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-primary/70">{gap.section}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="report-stack-grid grid gap-6 lg:grid-cols-2">
          <Card className="report-avoid-break">
            <CardHeader>
              <CardTitle>Plan 30 jours</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 text-sm leading-7 text-muted-foreground">
                {report.plan30Days.map((item, index) => (
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

          <Card className="report-avoid-break">
            <CardHeader>
              <CardTitle>Plan 90 jours</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 text-sm leading-7 text-muted-foreground">
                {report.plan90Days.map((item, index) => (
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
        </div>

        <Card className="report-avoid-break">
          <CardHeader>
            <CardTitle>Disclaimers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
            {report.disclaimers.map((item) => (
              <p key={item}>• {item}</p>
            ))}
          </CardContent>
        </Card>

        <Card className="print-hidden border-primary/20 bg-primary/5">
          <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <p className="text-sm leading-7 text-muted-foreground">
              Si la boîte d’impression ne s’ouvre pas automatiquement, utilisez le bouton ci-dessus pour imprimer ou
              enregistrer en PDF.
            </p>
            <Button type="button" variant="secondary" onClick={() => window.location.reload()}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Relancer l’impression
            </Button>
          </CardContent>
        </Card>
      </article>
    </section>
  );
}
