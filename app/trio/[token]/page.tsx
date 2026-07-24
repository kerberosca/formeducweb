import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  LockKeyhole,
  ShieldCheck
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UnlockReportButton } from "@/components/wizard/unlock-report-button";
import {
  findOrderByPublicToken,
  isEntitlementAccessible
} from "@/lib/commerce";
import {
  assessmentTypes,
  getDiagnosticConfig,
  normalizeAssessmentType,
  type AssessmentType
} from "@/lib/diagnostics";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mon Trio Hygiène numérique",
  robots: {
    index: false,
    follow: false,
    nocache: true
  }
};

function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${"•".repeat(Math.max(3, local.length - visible.length))}@${domain}`;
}

export default async function TrioDashboardPage({
  params
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const orders = await findOrderByPublicToken(token);
  if (!orders?.length) notFound();

  const email = orders[0].email;
  const allEntitlements = orders.flatMap((order) => order.entitlements);
  const byType = new Map<AssessmentType, (typeof allEntitlements)[number]>();
  const hasPaidBundle = orders.some(
    (order) =>
      order.status === "paid" &&
      ["digital_hygiene_trio", "trio_upgrade"].includes(order.productCode)
  );
  const upgradeSource = hasPaidBundle
    ? undefined
    : orders.find(
        (order) =>
          order.status === "paid" &&
          ["loi25_kit", "cyber_kit", "ai_kit"].includes(order.productCode) &&
          order.assessment &&
          (!order.accessExpiresAt || order.accessExpiresAt > new Date())
      );

  for (const entitlement of allEntitlements) {
    const type = normalizeAssessmentType(entitlement.assessmentType);
    const current = byType.get(type);
    const entitlementAccessible = isEntitlementAccessible(entitlement);
    const currentAccessible = current && isEntitlementAccessible(current);
    const entitlementRank =
      entitlementAccessible &&
      entitlement.status === "consumed" &&
      entitlement.assessment
        ? 4
        : entitlementAccessible && entitlement.status === "active"
          ? 3
          : 1;
    const currentRank =
      currentAccessible && current?.status === "consumed" && current.assessment
        ? 4
        : currentAccessible && current?.status === "active"
          ? 3
          : current
            ? 1
            : 0;
    if (entitlementRank >= currentRank) byType.set(type, entitlement);
  }

  return (
    <section className="container py-12 md:py-20">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-5">
          <Badge>Accès privé</Badge>
          <div className="space-y-3">
            <h1 className="font-heading text-4xl font-semibold tracking-tight md:text-5xl">
              Mon Trio Hygiène numérique
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
              Complétez chaque diagnostic une seule fois, puis revenez ici pour
              ouvrir votre Kit d’exécution 90 jours et ses gabarits
              personnalisés.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-white/75 px-4 py-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Accès associé à {maskEmail(email)} · 730 jours
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-3">
          {assessmentTypes.map((assessmentType) => {
            const diagnostic = getDiagnosticConfig(assessmentType);
            const entitlement = byType.get(assessmentType);
            const accessible = entitlement
              ? isEntitlementAccessible(entitlement)
              : false;
            const completed = Boolean(
              entitlement?.status === "consumed" &&
              entitlement.assessment &&
              accessible
            );
            const available = Boolean(
              entitlement?.status === "active" &&
              !entitlement.consumedAt &&
              accessible
            );
            const href = completed
              ? diagnostic.reportPath(
                  entitlement?.assessment?.accessToken as string
                )
              : available
                ? `${diagnostic.wizardPath}?entitlement=${encodeURIComponent(
                    entitlement?.accessToken as string
                  )}`
                : null;

            return (
              <Card key={assessmentType} className="flex h-full flex-col">
                <CardHeader className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant="outline">{diagnostic.shortLabel}</Badge>
                    {completed ? (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    ) : available ? (
                      <Clock3 className="h-5 w-5 text-primary" />
                    ) : (
                      <LockKeyhole className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <CardTitle>{diagnostic.reportTitle}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-between gap-5">
                  <p className="text-sm leading-7 text-muted-foreground">
                    {completed
                      ? "Diagnostic terminé. Le rapport, le PDF et les gabarits sont disponibles."
                      : available
                        ? "Droit disponible. Il sera lié à votre courriel d’achat et ne pourra être utilisé qu’une fois."
                        : "Ce droit est expiré, révoqué ou n’est pas compris dans cet accès."}
                  </p>
                  {href ? (
                    <Button asChild className="w-full">
                      <Link href={href}>
                        {completed
                          ? "Ouvrir mon kit"
                          : "Commencer le diagnostic"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  ) : (
                    <Button type="button" disabled className="w-full">
                      Accès indisponible
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {upgradeSource?.assessment ? (
          <Card className="border-primary/30 bg-gradient-to-br from-primary/10 via-background to-background">
            <CardContent className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
              <div>
                <p className="eyebrow">Offre d’amélioration</p>
                <h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight">
                  Ajoutez les deux autres kits pour 30 $ CAD
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                  Votre achat individuel est crédité : les deux droits restants
                  seront activés ici après la confirmation Stripe.
                </p>
              </div>
              <UnlockReportButton
                assessmentType={normalizeAssessmentType(
                  upgradeSource.assessment.assessmentType
                )}
                accessToken={upgradeSource.assessment.accessToken}
                profileComplete={Boolean(
                  upgradeSource.assessment.contactName &&
                  upgradeSource.assessment.companyName
                )}
                productCode="trio_upgrade"
                value={30}
                label="Améliorer vers le Trio (30 $)"
                className="w-full md:w-auto"
              />
            </CardContent>
          </Card>
        ) : null}

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="grid gap-4 p-6 text-sm leading-7 text-muted-foreground md:grid-cols-3">
            <p>
              <strong className="text-foreground">Accès :</strong> 730 jours à
              partir de l’achat.
            </p>
            <p>
              <strong className="text-foreground">Crédit :</strong> 29 $ CAD
              valide 90 jours sur un accompagnement admissible.
            </p>
            <p>
              <strong className="text-foreground">Remboursement :</strong> sous
              7 jours, avec révocation des accès.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
