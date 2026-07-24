import Link from "next/link";
import { Download, FileSpreadsheet, FileText, PhoneCall } from "lucide-react";

import { CopySnippetButton } from "@/components/wizard/copy-snippet-button";
import { UnlockReportButton } from "@/components/wizard/unlock-report-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildChecklistItems,
  buildFormSnippet,
  buildProcedureOnePager,
  getBonusAssetLabels
} from "@/lib/bonus-assets";
import { getDiagnosticConfig, type AssessmentType } from "@/lib/diagnostics";
import { getKitAssetsForType } from "@/lib/kit-assets";
import { getReportUnlockPriceLabel } from "@/lib/payments";
import type { GeneratedReport } from "@/lib/recommendations";
import type { LeadCaptureInput } from "@/lib/schemas";
import type { ScoreResult } from "@/lib/scoring";

type ReportViewProps = {
  assessmentType: AssessmentType;
  leadCapture: LeadCaptureInput;
  scoreResult: ScoreResult;
  report: GeneratedReport;
  accessToken: string;
  canUpgradeToTrio?: boolean;
};

export function ReportView({
  assessmentType,
  leadCapture,
  scoreResult,
  report,
  accessToken,
  canUpgradeToTrio = false
}: ReportViewProps) {
  const diagnostic = getDiagnosticConfig(assessmentType);
  const bonusLabels = getBonusAssetLabels(assessmentType);
  const kitAssets = getKitAssetsForType(assessmentType);
  const checklistItems = buildChecklistItems(report, scoreResult);
  const procedureText = buildProcedureOnePager(
    leadCapture.companyName,
    assessmentType
  );
  const formSnippet = buildFormSnippet(leadCapture.companyName, assessmentType);

  return (
    <section className="container py-12 md:py-16">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="eyebrow">Kit d’exécution 90 jours</p>
          <h1 className="font-heading text-4xl font-semibold tracking-tight">
            {diagnostic.reportTitle}
          </h1>
          <p className="mt-3 max-w-2xl text-lg leading-8 text-muted-foreground">
            Plan détaillé préparé pour {leadCapture.companyName}. Vous avez
            maintenant accès au PDF et aux gabarits DOCX/XLSX personnalisés
            associés à ce diagnostic.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="secondary">
            <a href={`/api/pdf?token=${accessToken}`}>
              <Download className="mr-2 h-4 w-4" />
              Télécharger PDF
            </a>
          </Button>
          <Button asChild variant="ghost">
            <Link href={`/contact?source=rapport-${diagnostic.leadSource}`}>
              Poser une question
            </Link>
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        <Card className="overflow-hidden">
          <CardContent className="grid gap-6 p-8 md:grid-cols-[1fr_auto] md:items-center">
            <div className="space-y-4">
              <Badge>{scoreResult.level.label}</Badge>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
                  Score global
                </p>
                <p className="font-heading text-6xl font-semibold text-primary">
                  {scoreResult.overallScore}/100
                </p>
              </div>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                {scoreResult.level.tagline}
              </p>
              <p className="text-sm leading-6 text-muted-foreground">
                {report.disclaimers[0]}
              </p>
            </div>

            <div className="space-y-3 rounded-[28px] border border-border/70 bg-muted/40 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary/70">
                Prochaine étape
              </p>
              <p className="text-sm leading-6 text-muted-foreground">
                Demandez un appel pour revoir vos priorités et décider quoi
                implanter en premier.
              </p>
              <Button asChild>
                <Link
                  href={`/contact?source=${diagnostic.leadSource}-rapport-appel`}
                >
                  <PhoneCall className="mr-2 h-4 w-4" />
                  Demander un appel
                </Link>
              </Button>
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
                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-primary/70">
                  Points forts
                </p>
                <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
                  {report.summary.highlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-primary/70">
                  À surveiller
                </p>
                <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
                  {report.summary.cautions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              {scoreResult.notes.length ? (
                <div>
                  <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-primary/70">
                    Notes
                  </p>
                  <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
                    {scoreResult.notes.map((item) => (
                      <li key={item}>{item}</li>
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
                    <p className="text-sm text-muted-foreground">
                      Section {section.sectionId}
                    </p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-xl font-semibold text-primary">
                      {section.percent}%
                    </p>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Niveau
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 des écarts prioritaires</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {report.topGaps.map((gap) => (
              <div
                key={`${gap.section}-${gap.title}`}
                className="rounded-[24px] border border-border/70 bg-background p-5"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="font-medium">{gap.title}</p>
                  <Badge variant="outline">{gap.priority}</Badge>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  {gap.whyItMatters}
                </p>
                <p className="mt-3 text-sm leading-6 text-foreground">
                  {gap.action}
                </p>
                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-primary/70">
                  {gap.section}
                </p>
              </div>
            ))}
            {report.topGapsContext ? (
              <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-4 md:col-span-2">
                <p className="text-sm leading-6 text-muted-foreground">
                  {report.topGapsContext}
                </p>
              </div>
            ) : null}
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
            <CardTitle>Vos gabarits éditables personnalisés</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {kitAssets.map((asset) => {
              const isSpreadsheet = asset.contentType.includes("spreadsheet");
              const AssetIcon = isSpreadsheet ? FileSpreadsheet : FileText;
              return (
                <div
                  key={asset.id}
                  className="flex h-full flex-col justify-between gap-4 rounded-[24px] border border-border/70 bg-background p-5"
                >
                  <div className="space-y-3">
                    <AssetIcon className="h-6 w-6 text-primary" />
                    <div>
                      <p className="font-medium">{asset.label}</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {asset.description}
                      </p>
                    </div>
                  </div>
                  <Button asChild variant="secondary" className="w-full">
                    <a
                      href={`/api/download/kit-asset?token=${encodeURIComponent(
                        accessToken
                      )}&asset=${asset.id}`}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Télécharger {isSpreadsheet ? "XLSX" : "DOCX"}
                    </a>
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card>
            <CardHeader>
              <CardTitle>Checklist de démarrage</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm leading-7 text-muted-foreground">
                {checklistItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{bonusLabels.snippetTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <pre className="overflow-x-auto whitespace-pre-wrap rounded-2xl border border-border/70 bg-muted/20 p-4 text-sm leading-7 text-muted-foreground">
                {formSnippet}
              </pre>
              <div className="flex flex-col gap-3 sm:flex-row">
                <CopySnippetButton value={formSnippet} />
                <Button asChild variant="secondary">
                  <a href={`/api/download/form-snippet?token=${accessToken}`}>
                    <FileText className="mr-2 h-4 w-4" />
                    Télécharger le texte
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{bonusLabels.procedureTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <pre className="overflow-x-auto whitespace-pre-wrap rounded-2xl border border-border/70 bg-muted/20 p-4 text-sm leading-7 text-muted-foreground">
              {procedureText}
            </pre>
            <Button asChild variant="secondary">
              <a href={`/api/download/procedure?token=${accessToken}`}>
                <FileText className="mr-2 h-4 w-4" />
                Télécharger la procédure
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6 text-sm leading-7 text-muted-foreground">
            <p className="font-medium text-foreground">Conditions du kit</p>
            <p>
              Accès pendant 730 jours. Crédit de {getReportUnlockPriceLabel()}{" "}
              valide 90 jours sur un accompagnement admissible. Remboursement
              demandé dans les 7 jours avec révocation de l’accès.
            </p>
          </CardContent>
        </Card>

        {canUpgradeToTrio ? (
          <Card className="overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 via-background to-background">
            <CardContent className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
              <div>
                <p className="eyebrow">Amélioration réservée aux acheteurs</p>
                <h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight">
                  Ajoutez les deux autres kits pour 30 $ CAD
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                  Passez au Trio Hygiène numérique sans repayer ce kit. Les deux
                  droits restants apparaîtront dans votre tableau de bord après
                  la confirmation Stripe.
                </p>
              </div>
              <UnlockReportButton
                assessmentType={assessmentType}
                accessToken={accessToken}
                profileComplete={Boolean(
                  leadCapture.contactName && leadCapture.companyName
                )}
                productCode="trio_upgrade"
                value={30}
                label="Améliorer vers le Trio (30 $)"
                className="w-full md:w-auto"
              />
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Disclaimers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
            {report.disclaimers.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
