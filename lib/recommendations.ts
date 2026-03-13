// lib/recommendations.ts
import type { GapItem, ScoreResult, WizardData, AssessmentAnswers } from "./scoring";

export type GeneratedReport = {
  summary: {
    score: number;
    levelLabel: string;
    levelTagline: string;
    highlights: string[];
    cautions: string[];
  };
  topGaps: Array<{
    title: string;
    whyItMatters: string;
    action: string;
    section: string;
    priority: "Élevée" | "Moyenne" | "Faible";
  }>;
  plan30Days: string[];
  plan90Days: string[];
  disclaimers: string[];
};

function priorityFromWeight(weight: number): "Élevée" | "Moyenne" | "Faible" {
  if (weight >= 8) return "Élevée";
  if (weight >= 5) return "Moyenne";
  return "Faible";
}

function defaultWhyItMatters(gap: GapItem): string {
  // Generic but useful
  if (gap.sectionId === "D") return "Réduit fortement les risques techniques (accès non autorisés, pertes, rançongiciel).";
  if (gap.sectionId === "E") return "Améliore la capacité à réagir rapidement et à documenter les événements.";
  if (gap.sectionId === "C") return "Augmente la transparence et diminue les surprises liées aux formulaires/cookies.";
  if (gap.sectionId === "B") return "Clarifie ce que vous collectez, où ça va, et pourquoi. Base de toute démarche.";
  if (gap.sectionId === "F") return "Structure la gouvernance: responsabilités, preuves et cohérence des pratiques.";
  return "Aide à réduire les risques et à structurer vos pratiques.";
}

function defaultActionText(gap: GapItem): string {
  if (gap.recommendation?.text) return gap.recommendation.text;
  return "Mettre en place une mesure simple et documentée pour combler cet écart.";
}

function computeHighlights(result: ScoreResult): string[] {
  const highlights: string[] = [];
  // pick top section scores
  const best = [...result.sectionScores].sort((a, b) => b.percent - a.percent).slice(0, 2);
  for (const s of best) {
    highlights.push(`${s.sectionTitle ?? s.sectionId} : ${s.percent}%`);
  }
  if (result.overallScore >= 70) highlights.push("Bon niveau global de préparation.");
  return highlights;
}

function computeCautions(result: ScoreResult): string[] {
  const cautions: string[] = [];
  const worst = [...result.sectionScores].sort((a, b) => a.percent - b.percent).slice(0, 2);
  for (const s of worst) {
    cautions.push(`À renforcer : ${s.sectionTitle ?? s.sectionId} (${s.percent}%)`);
  }
  if (result.overallScore < 40) cautions.push("Plusieurs bases ne sont pas en place (priorité aux actions 30 jours).");
  return cautions;
}

/**
 * Generate a report from scoring result + wizard content.
 * Uses wizard.report.planTemplates if available; otherwise uses defaults.
 * Also “personalizes” the 30/90 plan by injecting actions from top gaps.
 */
export function generateReport(
  wizard: WizardData,
  answers: AssessmentAnswers,
  score: ScoreResult
): GeneratedReport {
  const disclaimers = [
    wizard.disclaimer ??
      "Cet outil fournit une auto-évaluation et des recommandations générales. Il ne constitue pas un avis juridique.",
    "Les recommandations doivent être adaptées à votre réalité (données traitées, secteur, fournisseurs)."
  ];

  const highlights = computeHighlights(score);
  const cautions = computeCautions(score);

  const topGaps = score.gaps.map((g) => ({
    title: g.recommendation?.title ?? g.title,
    whyItMatters: defaultWhyItMatters(g),
    action: defaultActionText(g),
    section: g.sectionTitle ?? g.sectionId,
    priority: priorityFromWeight(g.weight)
  }));

  // Plan templates from JSON (if exists)
  const days30Template = (wizard as any)?.report?.planTemplates?.days30 as string[] | undefined;
  const days90Template = (wizard as any)?.report?.planTemplates?.days90 as string[] | undefined;

  let plan30Days = days30Template?.length
    ? [...days30Template]
    : [
        "Créer l’inventaire des données et des systèmes (cartographie).",
        "Mettre/mettre à jour la politique de confidentialité + liens visibles.",
        "Activer MFA sur les comptes critiques.",
        "Mettre en place des sauvegardes et tester une restauration.",
        "Démarrer un registre d’incidents + procédure 1 page."
      ];

  let plan90Days = days90Template?.length
    ? [...days90Template]
    : [
        "Revoir les accès par rôles et faire un nettoyage des comptes.",
        "Mettre en place/ajuster la gestion du consentement (si applicable).",
        "Documenter une procédure de traitement des demandes (accès/correction/retrait).",
        "Revoir les fournisseurs et clauses liées à la protection des données.",
        "Faire une simulation d’incident (table-top) et améliorer la procédure."
      ];

  // Inject the top gaps actions into the plan (dedupe)
  const injectedActions = topGaps
    .filter((g) => g.priority !== "Faible")
    .slice(0, 3)
    .map((g) => `Action prioritaire: ${g.action}`);

  const dedupe = (arr: string[]) => Array.from(new Set(arr.map((s) => s.trim())));

  plan30Days = dedupe([...injectedActions, ...plan30Days]).slice(0, 8);
  plan90Days = dedupe([...plan90Days]).slice(0, 8);

  // Small personalization examples using answers (optional)
  // Example: if they use tracking tools, suggest consent/cookies work more strongly
  const usesTracking = ["yes", "not_sure"].includes(String(answers["C4"] ?? "").toLowerCase());
  if (usesTracking && !plan30Days.some((x) => x.toLowerCase().includes("cookies"))) {
    plan30Days = dedupe([
      "Vérifier les cookies/trackers (GA/Pixel/etc.) et documenter leur usage.",
      ...plan30Days
    ]);
  }

  return {
    summary: {
      score: score.overallScore,
      levelLabel: score.level.label,
      levelTagline: score.level.tagline,
      highlights,
      cautions
    },
    topGaps,
    plan30Days,
    plan90Days,
    disclaimers
  };
}