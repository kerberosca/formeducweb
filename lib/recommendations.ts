import type { AssessmentAnswers, GapItem, ScoreResult, WizardData, WizardQuestion } from "./scoring";

export type ReportPriority = "Élevée" | "Moyenne" | "Faible";

export type DiagnosticAnchor = {
  questionId: string;
  questionLabel: string;
  section: string;
  action: string;
};

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
    priority: ReportPriority;
  }>;
  topGapsContext?: string;
  criticalTopGapsCount?: number;
  diagnosticAnchors: DiagnosticAnchor[];
  plan30Days: string[];
  plan90Days: string[];
  disclaimers: string[];
};

type ReportGap = GeneratedReport["topGaps"][number] & {
  sectionId: string;
};

function priorityFromWeight(weight: number): ReportPriority {
  if (weight >= 8) return "Élevée";
  if (weight >= 5) return "Moyenne";
  return "Faible";
}

function defaultWhyItMatters(gap: GapItem): string {
  if (gap.sectionId === "D") {
    return "Réduit fortement les risques techniques (accès non autorisés, pertes, rançongiciel).";
  }
  if (gap.sectionId === "E") {
    return "Améliore la capacité à réagir rapidement et à documenter les événements.";
  }
  if (gap.sectionId === "C") {
    return "Augmente la transparence et diminue les surprises liées aux formulaires/cookies.";
  }
  if (gap.sectionId === "B") {
    return "Clarifie ce que vous collectez, où ça va, et pourquoi. Base de toute démarche.";
  }
  if (gap.sectionId === "F") {
    return "Structure la gouvernance: responsabilités, preuves et cohérence des pratiques.";
  }

  return "Aide à réduire les risques et à structurer vos pratiques.";
}

function defaultActionText(gap: GapItem): string {
  if (gap.recommendation?.text) return gap.recommendation.text;
  return "Mettre en place une mesure simple et documentée pour combler cet écart.";
}

function consolidationActionBySection(sectionId: string) {
  if (sectionId === "B") {
    return "Reviser la cartographie des donnees et confirmer les regles de conservation et suppression avec les responsables.";
  }
  if (sectionId === "C") {
    return "Verifier les formulaires, la transparence et les mecanismes de consentement sur le site avec un controle mensuel.";
  }
  if (sectionId === "D") {
    return "Planifier une revue technique trimestrielle (MFA, acces, sauvegardes, mises a jour) avec preuve datee.";
  }
  if (sectionId === "E") {
    return "Tester la procedure d'incident avec un scenario simple et consigner les ajustements a faire.";
  }
  if (sectionId === "F") {
    return "Centraliser les preuves de gouvernance (politiques, registres, revues) et fixer un rythme de mise a jour.";
  }

  return "Maintenir une revue periodique des pratiques et documenter les actions pour garder un niveau stable.";
}

function priorityFromSectionPercent(percent: number): ReportPriority {
  if (percent < 55) return "Élevée";
  if (percent < 80) return "Moyenne";
  return "Faible";
}

function buildConsolidationGap(section: ScoreResult["sectionScores"][number]): ReportGap {
  const sectionLabel = section.sectionTitle ?? `Section ${section.sectionId}`;
  const fakeGap: GapItem = {
    questionId: `consolidation-${section.sectionId}`,
    sectionId: section.sectionId,
    sectionTitle: section.sectionTitle,
    title: sectionLabel,
    weight: 0,
    answerValue: null,
    answerScore: 4,
    recommendation: null,
    severity: 0
  };

  return {
    title: `Consolider ${sectionLabel}`,
    whyItMatters: defaultWhyItMatters(fakeGap),
    action: consolidationActionBySection(section.sectionId),
    section: sectionLabel,
    priority: priorityFromSectionPercent(section.percent),
    sectionId: section.sectionId
  };
}

const GENERIC_CONSOLIDATION_GAPS: ReportGap[] = [
  {
    title: "Consolider les pratiques deja en place",
    whyItMatters: "Un bon niveau doit etre entretenu pour rester fiable dans le temps.",
    action: "Planifier une revue mensuelle courte des mesures deja implantees et corriger rapidement les ecarts.",
    section: "Consolidation",
    priority: "Moyenne",
    sectionId: "CONSOLIDATION_1"
  },
  {
    title: "Centraliser les preuves de conformite",
    whyItMatters: "Des preuves simples et datees facilitent la gouvernance et la prise de decision.",
    action: "Regrouper politiques, journaux, captures et decisions dans un espace unique maintenu a jour.",
    section: "Consolidation",
    priority: "Moyenne",
    sectionId: "CONSOLIDATION_2"
  },
  {
    title: "Valider les mecanismes critiques",
    whyItMatters: "Les controles non verifies peuvent se degrader sans etre visibles.",
    action: "Faire un mini test trimestriel sur les acces, sauvegardes et formulaires puis noter les resultats.",
    section: "Consolidation",
    priority: "Moyenne",
    sectionId: "CONSOLIDATION_3"
  }
];

function buildTopGapsContext(criticalCount: number) {
  if (criticalCount >= 5) return undefined;
  if (criticalCount === 4) {
    return "4 écarts critiques ont été détectés sous le seuil. La 5e priorité est une action de consolidation pour protéger vos acquis.";
  }
  if (criticalCount === 3) {
    return "3 écarts critiques ont été détectés sous le seuil. Les priorités 4 et 5 sont des actions de consolidation pour maintenir votre niveau.";
  }
  if (criticalCount === 2) {
    return "2 écarts critiques ont été détectés sous le seuil. Les priorités 3 à 5 sont des actions de consolidation pour maintenir votre niveau.";
  }
  if (criticalCount === 1) {
    return "1 écart critique a été détecté sous le seuil. Les priorités 2 à 5 sont des actions de consolidation pour renforcer la stabilité.";
  }
  return "Aucun écart critique n'a été détecté sous le seuil. Les 5 priorités proposées sont des actions de consolidation pour garder vos pratiques solides.";
}

function ensureFiveTopGaps(criticalTopGaps: ReportGap[], score: ScoreResult) {
  const selected = criticalTopGaps.slice(0, 5);
  const criticalCount = selected.length;
  const seenTitles = new Set(selected.map((gap) => `${gap.section}|${gap.title}`.toLowerCase()));
  const seenSectionIds = new Set(selected.map((gap) => gap.sectionId));

  const sortedSections = [...score.sectionScores].sort((a, b) => a.percent - b.percent);

  for (const section of sortedSections) {
    if (selected.length >= 5) break;
    if (seenSectionIds.has(section.sectionId)) continue;

    const consolidationGap = buildConsolidationGap(section);
    const key = `${consolidationGap.section}|${consolidationGap.title}`.toLowerCase();
    if (seenTitles.has(key)) continue;

    selected.push(consolidationGap);
    seenTitles.add(key);
    seenSectionIds.add(section.sectionId);
  }

  for (const fallback of GENERIC_CONSOLIDATION_GAPS) {
    if (selected.length >= 5) break;

    const key = `${fallback.section}|${fallback.title}`.toLowerCase();
    if (seenTitles.has(key)) continue;

    selected.push(fallback);
    seenTitles.add(key);
  }

  return {
    topGaps: selected.map(({ sectionId, ...gap }) => gap),
    criticalCount,
    topGapsContext: buildTopGapsContext(criticalCount)
  };
}
function computeHighlights(result: ScoreResult): string[] {
  const highlights: string[] = [];
  const best = [...result.sectionScores].sort((a, b) => b.percent - a.percent).slice(0, 2);

  for (const section of best) {
    highlights.push(`${section.sectionTitle ?? section.sectionId} : ${section.percent}%`);
  }

  if (result.overallScore >= 70) {
    highlights.push("Bon niveau global de préparation.");
  }

  return highlights;
}

function computeCautions(result: ScoreResult): string[] {
  const cautions: string[] = [];
  const worst = [...result.sectionScores].sort((a, b) => a.percent - b.percent).slice(0, 2);

  for (const section of worst) {
    cautions.push(`À renforcer : ${section.sectionTitle ?? section.sectionId} (${section.percent}%)`);
  }

  if (result.overallScore < 40) {
    cautions.push("Plusieurs bases ne sont pas en place (priorité aux actions 30 jours).");
  }

  return cautions;
}

function dedupeLines(values: string[]) {
  return Array.from(
    new Set(
      values
        .map((value) => value.trim())
        .filter((value) => value.length > 0)
    )
  );
}

function answerIs(answers: AssessmentAnswers, questionId: string, expectedValues: string[]) {
  const value = String(answers[questionId] ?? "").toLowerCase().trim();
  return expectedValues.includes(value);
}

function getBranchActions(answers: AssessmentAnswers) {
  const items: string[] = [];

  if (answerIs(answers, "C4", ["yes", "not_sure"])) {
    items.push(
      "Documenter les cookies/trackers actifs (GA, pixels, chat) et bloquer le non essentiel avant consentement."
    );
  }
  if (answerIs(answers, "C3", ["no", "partial"])) {
    items.push("Ajouter un avis de transparence sous chaque formulaire (finalité + lien vers la politique).");
  }
  if (answerIs(answers, "D1", ["no", "some"])) {
    items.push("Activer MFA sur courriel, hébergement, CMS et CRM pour 100 % des comptes critiques.");
  }
  if (answerIs(answers, "D3", ["no", "yes_not_tested"])) {
    items.push("Exécuter un test de restauration (site + base de données) et consigner le résultat.");
  }
  if (answerIs(answers, "E1", ["no", "partial"])) {
    items.push("Rédiger une procédure d'incident 1 page (détection, confinement, communication, journal).");
  }
  if (answerIs(answers, "B2", ["no", "partial"])) {
    items.push("Compléter la cartographie des données (source, système, responsable, conservation).");
  }
  if (answerIs(answers, "D2", ["no", "partial"])) {
    items.push("Resserrer les accès par rôles et retirer les accès obsolètes.");
  }

  return dedupeLines(items);
}

function getBranchMilestones90(answers: AssessmentAnswers) {
  const items: string[] = [];

  if (answerIs(answers, "C4", ["yes", "not_sure"])) {
    items.push(
      "Mois 2-3 - Valider en conditions réelles le déclenchement des scripts analytics/pixels avec et sans consentement."
    );
  }
  if (answerIs(answers, "C3", ["no", "partial"])) {
    items.push("Mois 2-3 - Standardiser le texte de transparence sur 100 % des formulaires et mesurer l'adoption.");
  }
  if (answerIs(answers, "D1", ["no", "some"])) {
    items.push("Mois 2-3 - Étendre MFA aux comptes secondaires et tester un scénario de récupération MFA.");
  }
  if (answerIs(answers, "D3", ["no", "yes_not_tested"])) {
    items.push("Mois 2-3 - Formaliser un test de restauration trimestriel avec temps cible et preuve datée.");
  }
  if (answerIs(answers, "E1", ["no", "partial"])) {
    items.push("Mois 2-3 - Réaliser un exercice table-top incident et mettre à jour la procédure selon les écarts.");
  }
  if (answerIs(answers, "B2", ["no", "partial"])) {
    items.push("Mois 2-3 - Ajouter les flux inter-fournisseurs à la cartographie et associer une rétention.");
  }
  if (answerIs(answers, "D2", ["no", "partial"])) {
    items.push("Mois 2-3 - Automatiser une revue mensuelle des accès et conserver la preuve de retrait.");
  }

  return dedupeLines(items);
}

function buildPlan30Days(
  topGaps: GeneratedReport["topGaps"],
  answers: AssessmentAnswers,
  days30Template?: string[]
) {
  const nonLowGapActions = topGaps
    .filter((gap) => gap.priority !== "Faible")
    .slice(0, 2)
    .map((gap) => `Priorité immédiate: ${gap.action}`);

  const fallbackGapActions =
    nonLowGapActions.length > 0
      ? nonLowGapActions
      : topGaps.slice(0, 2).map((gap) => `Priorité immédiate: ${gap.action}`);

  const branchActions = getBranchActions(answers).slice(0, 3);
  const template = days30Template?.length
    ? days30Template
    : [
        "Créer l'inventaire des données et des systèmes (cartographie).",
        "Mettre à jour la politique de confidentialité et les liens visibles.",
        "Activer MFA sur les comptes critiques.",
        "Mettre en place des sauvegardes et tester une restauration.",
        "Démarrer un registre d'incidents et une procédure 1 page."
      ];

  const starter = dedupeLines([
    ...fallbackGapActions,
    ...branchActions,
    "Préparer les gabarits de base (registre d'incident, procédure 1 page, texte de formulaire)."
  ]);

  if (starter.length >= 6) {
    return starter.slice(0, 6);
  }

  return dedupeLines([...starter, ...template]).slice(0, 6);
}

function buildPlan90Days(
  topGaps: GeneratedReport["topGaps"],
  answers: AssessmentAnswers,
  plan30Days: string[],
  days90Template?: string[]
) {
  const template = days90Template?.length
    ? days90Template
    : [
        "Revoir les accès par rôles et nettoyer les comptes inactifs.",
        "Ajuster la gestion du consentement (si applicable).",
        "Documenter le traitement des demandes d'accès/correction/retrait.",
        "Revoir les fournisseurs et clauses liées à la protection des données.",
        "Faire une simulation d'incident (table-top) et améliorer la procédure."
      ];

  const gapMilestones = topGaps.map(
    (gap) =>
      `Mois 2-3 - ${gap.title}: consolider la mesure, conserver une preuve datée et suivre un indicateur mensuel.`
  );

  const branchMilestones = getBranchMilestones90(answers);

  const transversalMilestones = [
    "J45 - Revue intermédiaire des actions 30 jours avec ajustements sur les priorités.",
    "Revue mensuelle - suivre 3 indicateurs (MFA actif, restauration testée, formulaires conformes).",
    "Constituer un dossier de preuves centralisé (captures, registres, décisions et dates).",
    "Réaliser une capsule de sensibilisation d'équipe et noter les présences.",
    "Revue trimestrielle - valider la cartographie, la rétention et les accès."
  ];

  let plan = dedupeLines([...template, ...gapMilestones, ...branchMilestones, ...transversalMilestones]);

  const minTarget = Math.max(10, Math.min(14, plan30Days.length + 3));
  const guaranteeMilestones = [
    "J45 - Confirmer l'avancement de chaque priorité avec preuve simple (capture ou note datée).",
    "Mois 3 - Mettre à jour les politiques internes selon les changements techniques implantés.",
    "Mois 3 - Préparer une courte rétro et décider des améliorations du trimestre suivant."
  ];

  let guaranteeIndex = 0;
  while (plan.length < minTarget && guaranteeIndex < guaranteeMilestones.length) {
    plan = dedupeLines([...plan, guaranteeMilestones[guaranteeIndex]]);
    guaranteeIndex += 1;
  }

  return plan.slice(0, 14);
}

function buildDiagnosticAnchors(
  wizardQuestionsById: Map<string, WizardQuestion>,
  rawGaps: GapItem[],
  topGaps: GeneratedReport["topGaps"]
): DiagnosticAnchor[] {
  return rawGaps.slice(0, 5).map((gap, index) => {
    const questionLabel = wizardQuestionsById.get(gap.questionId)?.title ?? gap.title;
    const section = gap.sectionTitle ? `Section ${gap.sectionId} - ${gap.sectionTitle}` : `Section ${gap.sectionId}`;

    return {
      questionId: gap.questionId,
      questionLabel,
      section,
      action: topGaps[index]?.action ?? defaultActionText(gap)
    };
  });
}

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
  const wizardQuestionsById = new Map<string, WizardQuestion>(wizard.questions.map((question) => [question.id, question]));

  const criticalTopGaps: ReportGap[] = score.gaps.map((gap) => ({
    title: gap.recommendation?.title ?? gap.title,
    whyItMatters: defaultWhyItMatters(gap),
    action: defaultActionText(gap),
    section: gap.sectionTitle ?? gap.sectionId,
    priority: priorityFromWeight(gap.weight),
    sectionId: gap.sectionId
  }));
  const topGapsBundle = ensureFiveTopGaps(criticalTopGaps, score);
  const topGaps = topGapsBundle.topGaps;

  const days30Template = (wizard as { report?: { planTemplates?: { days30?: string[] } } }).report?.planTemplates?.days30;
  const days90Template = (wizard as { report?: { planTemplates?: { days90?: string[] } } }).report?.planTemplates?.days90;

  const plan30Days = buildPlan30Days(topGaps, answers, days30Template);
  const plan90Days = buildPlan90Days(topGaps, answers, plan30Days, days90Template);
  const diagnosticAnchors = buildDiagnosticAnchors(wizardQuestionsById, score.gaps, topGaps);

  return {
    summary: {
      score: score.overallScore,
      levelLabel: score.level.label,
      levelTagline: score.level.tagline,
      highlights,
      cautions
    },
    topGaps,
    topGapsContext: topGapsBundle.topGapsContext,
    criticalTopGapsCount: topGapsBundle.criticalCount,
    diagnosticAnchors,
    plan30Days,
    plan90Days,
    disclaimers
  };
}
