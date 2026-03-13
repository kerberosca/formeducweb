"use client";

import Link from "next/link";
import { Download, PhoneCall, RotateCcw, SquarePen } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GeneratedReport } from "@/lib/recommendations";
import type { ScoreResult } from "@/lib/scoring";
import { siteConfig } from "@/lib/site";
import type { LeadCaptureInput } from "@/lib/schemas";
import type { WizardDataset } from "@/lib/wizard";

type ReportViewProps = {
  wizard: WizardDataset;
  leadCapture: LeadCaptureInput;
  scoreResult: ScoreResult;
  report: GeneratedReport;
  onEdit: () => void;
  onRestart: () => void;
};

export function ReportView({ wizard, leadCapture, scoreResult, report, onEdit, onRestart }: ReportViewProps) {
  const bookingHref = siteConfig.bookingUrl;

  return (
    <section className="container py-12 md:py-16">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between print-hidden">
        <div>
          <p className="eyebrow">Rapport généré</p>
          <h1 className="font-heading text-4xl font-semibold tracking-tight">Votre diagnostic Loi 25</h1>
          <p className="mt-3 max-w-2xl text-lg leading-8 text-muted-foreground">
            Rapport préparé pour {leadCapture.companyName}. Ce diagnostic vise l’alignement et la priorisation des
            prochaines actions.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="button" variant="secondary" onClick={() => window.print()}>
            <Download className="mr-2 h-4 w-4" />
            Télécharger PDF
          </Button>
          <Button type="button" variant="secondary" onClick={onEdit}>
            <SquarePen className="mr-2 h-4 w-4" />
            Modifier mes réponses
          </Button>
          <Button type="button" variant="ghost" onClick={onRestart}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Recommencer
          </Button>
        </div>
      </div>

      <div id="rapport-loi25" className="space-y-8 print-surface">
        <Card className="overflow-hidden">
          <CardContent className="grid gap-6 p-8 md:grid-cols-[1fr_auto] md:items-center">
            <div className="space-y-4">
              <Badge>{scoreResult.level.label}</Badge>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Score global</p>
                <p className="font-heading text-6xl font-semibold text-primary">{scoreResult.overallScore}/100</p>
              </div>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">{scoreResult.level.tagline}</p>
              <p className="text-sm leading-6 text-muted-foreground">{wizard.disclaimer}</p>
            </div>

            <div className="space-y-3 rounded-[28px] border border-border/70 bg-muted/40 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary/70">Prochaine étape</p>
              <p className="text-sm leading-6 text-muted-foreground">
                Planifiez un appel de 20 minutes pour passer vos priorités et choisir le bon niveau d’accompagnement.
              </p>
              <Button asChild>
                <a href={bookingHref}>
                  <PhoneCall className="mr-2 h-4 w-4" />
                  Planifier un appel 20 min
                </a>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/contact?source=rapport-loi25">Poser une question</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card>
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

          <Card>
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

        <Card>
          <CardHeader>
            <CardTitle>Écarts prioritaires</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {report.topGaps.map((gap) => (
              <div key={`${gap.section}-${gap.title}`} className="rounded-[24px] border border-border/70 bg-background p-5">
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

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
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

          <Card>
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

        <Card>
          <CardHeader>
            <CardTitle>Disclaimers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
            {report.disclaimers.map((item) => (
              <p key={item}>• {item}</p>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

