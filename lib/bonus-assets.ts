import type { GeneratedReport } from "@/lib/recommendations";
import type { ScoreResult } from "@/lib/scoring";

function csvEscape(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

export function buildIncidentRegistryCsv(companyName: string) {
  const rows = [
    ["date", "système", "type", "description", "impact", "mesures", "statut", "leçons"],
    [
      new Date().toISOString().slice(0, 10),
      `${companyName} - site web`,
      "Incident potentiel",
      "Décrire brièvement l'événement, la source du signalement et le contexte.",
      "Impact à confirmer",
      "Isolation du système concerné, collecte des journaux, validation des accès.",
      "Ouvert",
      "À compléter après le retour d'expérience."
    ]
  ];

  return rows.map((row) => row.map((cell) => csvEscape(cell)).join(",")).join("\n");
}

export function buildProcedureOnePager(companyName: string) {
  return [
    `Procédure 1 page - Gestion d'incident (${companyName})`,
    "",
    "1. Détecter et signaler",
    "Toute anomalie liée à des données personnelles doit être signalée rapidement au responsable interne.",
    "",
    "2. Contenir",
    "Limiter l'accès, suspendre les comptes compromis et préserver les preuves utiles.",
    "",
    "3. Documenter",
    "Consigner la date, les systèmes touchés, la nature des données, les impacts connus et les mesures prises.",
    "",
    "4. Évaluer",
    "Déterminer si l'incident présente un risque de préjudice sérieux et si des notifications sont requises.",
    "",
    "5. Corriger",
    "Appliquer les correctifs, valider les accès, tester la reprise et mettre à jour les documents internes."
  ].join("\n");
}

export function buildFormSnippet(companyName: string) {
  return [
    "Texte suggéré pour un formulaire web",
    "",
    `Les renseignements transmis à ${companyName} sont utilisés uniquement pour traiter votre demande, assurer le suivi et améliorer nos services.`,
    "Ils sont accessibles seulement aux personnes autorisées et conservés selon nos pratiques internes de gestion de l'information.",
    "Pour toute question liée à vos renseignements personnels, contactez-nous à l'adresse indiquée dans notre politique de confidentialité."
  ].join("\n");
}

export function buildChecklistItems(report: GeneratedReport, scoreResult: ScoreResult) {
  const sectionsToWatch = [...scoreResult.sectionScores]
    .sort((a, b) => a.percent - b.percent)
    .slice(0, 3)
    .map((item) => `Renforcer la section ${item.sectionId} - ${item.sectionTitle}.`);

  const topActions = report.topGaps.slice(0, 3).map((gap) => gap.action);

  return Array.from(new Set([...topActions, ...report.plan30Days.slice(0, 3), ...sectionsToWatch])).slice(0, 8);
}
