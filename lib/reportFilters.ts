import type { GeneratedReport } from "@/lib/recommendations";

type TopGap = GeneratedReport["topGaps"][number];

const CONSOLIDATION_PRIORITY_TEMPLATES: TopGap[] = [
  {
    title: "Consolider les pratiques deja en place",
    whyItMatters: "Une bonne posture reste fragile si elle n'est pas revue regulierement.",
    action: "Planifiez une revue mensuelle rapide des mesures deja implantees et corrigez les ecarts detectes.",
    section: "Consolidation",
    priority: "Moyenne"
  },
  {
    title: "Centraliser les preuves de conformite",
    whyItMatters: "Des preuves simples et datees facilitent le suivi et evitent les oublis.",
    action: "Regroupez politiques, captures, journaux et decisions dans un dossier unique maintenu a jour.",
    section: "Consolidation",
    priority: "Moyenne"
  },
  {
    title: "Tester les mecanismes critiques",
    whyItMatters: "Sans verification periodique, les mecanismes peuvent se degrader sans etre visibles.",
    action: "Faites un mini test trimestriel (acces, sauvegarde, formulaires) et notez le resultat.",
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
    plan90DaysTeaser: "Debloquez le rapport complet pour obtenir le plan 90 jours adapte a votre contexte.",
    disclaimers: fullReport.disclaimers,
    upsellTeaser: "Passez du diagnostic a l'implantation avec un rapport complet pret a utiliser."
  };
}
