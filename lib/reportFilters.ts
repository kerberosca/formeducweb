import type { GeneratedReport } from "@/lib/recommendations";

export type LiteReport = {
  summary: {
    score: number;
    levelLabel: string;
    levelTagline: string;
    highlights: string[];
    cautions: string[];
  };
  topGaps: GeneratedReport["topGaps"];
  plan30Days: string[];
  plan90DaysTeaser: string;
  disclaimers: string[];
  upsellTeaser: string;
};

export function toLiteReport(fullReport: GeneratedReport): LiteReport {
  return {
    summary: {
      score: fullReport.summary.score,
      levelLabel: fullReport.summary.levelLabel,
      levelTagline: fullReport.summary.levelTagline,
      highlights: fullReport.summary.highlights.slice(0, 2),
      cautions: fullReport.summary.cautions.slice(0, 2)
    },
    topGaps: fullReport.topGaps.slice(0, 3),
    plan30Days: fullReport.plan30Days.slice(0, 5),
    plan90DaysTeaser: "Debloquez le rapport complet pour obtenir le plan 90 jours adapte a votre contexte.",
    disclaimers: fullReport.disclaimers,
    upsellTeaser: "Passez du diagnostic a l'implantation avec un rapport complet pret a utiliser."
  };
}
