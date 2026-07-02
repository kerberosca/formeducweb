import type { GeneratedReport } from "@/lib/recommendations";

type TopGap = GeneratedReport["topGaps"][number];

const CONSOLIDATION_PRIORITY_TEMPLATES: TopGap[] = [
  {
    title: "Consolider les pratiques déjà en place",
    whyItMatters: "Une bonne posture reste fragile si elle n'est pas revue régulièrement.",
    action: "Planifiez une revue mensuelle rapide des mesures déjà implantées et corrigez les écarts détectés.",
    section: "Consolidation",
    priority: "Moyenne"
  },
  {
    title: "Centraliser les preuves de conformité",
    whyItMatters: "Des preuves simples et datées facilitent le suivi et évitent les oublis.",
    action: "Regroupez politiques, captures, journaux et décisions dans un dossier unique maintenu à jour.",
    section: "Consolidation",
    priority: "Moyenne"
  },
  {
    title: "Tester les mécanismes critiques",
    whyItMatters: "Sans vérification périodique, les mécanismes peuvent se dégrader sans être visibles.",
    action: "Faites un mini test trimestriel (accès, sauvegarde, formulaires) et notez le résultat.",
    section: "Consolidation",
    priority: "Moyenne"
  }
];

function normalizeCriticalCount(knownCount: number | undefined, fallbackCount: number) {
  if (typeof knownCount !== "number" || !Number.isFinite(knownCount)) {
    return fallbackCount;
  }

  return Math.max(0, Math.min(3, Math.round(knownCount)));
}

function ensureThreePriorities(topGaps: GeneratedReport["topGaps"], knownCriticalCount?: number) {
  const criticalGaps = topGaps.slice(0, 3);
  const criticalCount = normalizeCriticalCount(knownCriticalCount, criticalGaps.length);

  if (criticalGaps.length >= 3) {
    return {
      topGaps: criticalGaps,
      criticalCount
    };
  }

  const missingCount = 3 - criticalGaps.length;
  const fallbackPriorities = CONSOLIDATION_PRIORITY_TEMPLATES.slice(0, missingCount);

  return {
    topGaps: [...criticalGaps, ...fallbackPriorities],
    criticalCount
  };
}

function buildPrioritiesContext(criticalCount: number) {
  if (criticalCount >= 3) return undefined;

  if (criticalCount === 2) {
    return "Deux écarts critiques ont été détectés sous le seuil. La 3e priorité est une action de consolidation pour maintenir votre niveau.";
  }

  if (criticalCount === 1) {
    return "Un seul écart critique a été détecté sous le seuil. Les priorités 2 et 3 sont des actions de consolidation pour garder vos acquis.";
  }

  return "Aucun écart critique n'a été détecté sous le seuil. Les 3 priorités proposées sont des actions de consolidation pour garder vos pratiques stables.";
}

export type LiteReport = {
  summary: {
    score: number;
    levelLabel: string;
    levelTagline: string;
    highlights: string[];
    cautions: string[];
  };
  topGaps: GeneratedReport["topGaps"];
  prioritiesContext?: string;
  plan30Days: string[];
  plan90DaysTeaser: string;
  disclaimers: string[];
  upsellTeaser: string;
};

export function toLiteReport(fullReport: GeneratedReport): LiteReport {
  const guaranteedPriorities = ensureThreePriorities(fullReport.topGaps, fullReport.criticalTopGapsCount);

  return {
    summary: {
      score: fullReport.summary.score,
      levelLabel: fullReport.summary.levelLabel,
      levelTagline: fullReport.summary.levelTagline,
      highlights: fullReport.summary.highlights.slice(0, 2),
      cautions: fullReport.summary.cautions.slice(0, 2)
    },
    topGaps: guaranteedPriorities.topGaps,
    prioritiesContext: buildPrioritiesContext(guaranteedPriorities.criticalCount),
    plan30Days: fullReport.plan30Days.slice(0, 5),
    plan90DaysTeaser: "Débloquez le rapport complet pour obtenir le plan 90 jours adapté à votre contexte.",
    disclaimers: fullReport.disclaimers,
    upsellTeaser: "Passez du diagnostic à l'implantation avec un rapport complet prêt à utiliser."
  };
}
