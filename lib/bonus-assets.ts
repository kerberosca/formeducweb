import { getDiagnosticConfig, type AssessmentType } from "@/lib/diagnostics";
import type { GeneratedReport } from "@/lib/recommendations";
import type { ScoreResult } from "@/lib/scoring";

export function buildProcedureOnePager(companyName: string, assessmentType: AssessmentType = "loi25") {
  if (assessmentType === "cybersecurity") {
    return [
      `Procédure 1 page - Signalement cyber (${companyName})`,
      "",
      "1. Signaler rapidement",
      "Toute anomalie (courriel suspect, compte compromis, fichier chiffré, accès inhabituel) doit être signalée au responsable interne.",
      "",
      "2. Contenir",
      "Ne pas effacer les preuves. Isoler l'appareil ou suspendre l'accès si la situation le demande.",
      "",
      "3. Documenter",
      "Noter la date, l'utilisateur, le système touché, les symptômes, captures disponibles et actions déjà prises.",
      "",
      "4. Escalader",
      "Contacter le fournisseur TI, l'hébergeur ou la direction selon le système touché et l'impact opérationnel.",
      "",
      "5. Corriger et apprendre",
      "Appliquer les correctifs, changer les mots de passe, tester la reprise et ajouter une prévention dans la checklist."
    ].join("\n");
  }

  if (assessmentType === "ai") {
    return [
      `Charte IA courte (${companyName})`,
      "",
      "1. Usages permis",
      "Utiliser l'IA pour idéation, brouillons, résumés, structuration et aide à l'analyse lorsque le résultat est relu par une personne.",
      "",
      "2. Données interdites",
      "Ne pas entrer de données clients, données personnelles, secrets commerciaux, informations RH ou documents confidentiels dans un outil non approuvé.",
      "",
      "3. Validation humaine",
      "Tout contenu externe, décision importante ou recommandation sensible doit être validé par une personne responsable.",
      "",
      "4. Outils approuvés",
      "Utiliser seulement les outils autorisés par l'entreprise et vérifier les conditions de confidentialité.",
      "",
      "5. Amélioration continue",
      "Documenter les bons exemples, limites observées et ajustements à faire."
    ].join("\n");
  }

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

export function buildFormSnippet(companyName: string, assessmentType: AssessmentType = "loi25") {
  if (assessmentType === "cybersecurity") {
    return [
      "Mémo équipe - Réflexes cyber",
      "",
      "1. Activer MFA partout où c'est possible.",
      "2. Ne jamais partager un mot de passe par courriel ou clavardage.",
      "3. Vérifier hors courriel toute demande de paiement, changement bancaire ou urgence inhabituelle.",
      "4. Signaler rapidement tout courriel suspect, perte d'appareil ou comportement anormal.",
      "5. En cas de doute, ralentir et demander validation avant de cliquer, payer ou transmettre."
    ].join("\n");
  }

  if (assessmentType === "ai") {
    return [
      "Mémo équipe - Utilisation responsable de l'IA",
      "",
      "1. Ne pas entrer de données clients, personnelles ou confidentielles dans un outil IA non approuvé.",
      "2. Vérifier les faits, chiffres, sources et conclusions avant toute utilisation externe.",
      "3. Utiliser l'IA comme assistant de travail, pas comme décisionnaire final.",
      "4. Documenter les usages importants et les résultats réutilisables.",
      "5. Demander validation lorsqu'un usage touche clients, RH, finances, juridique ou réputation."
    ].join("\n");
  }

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

export function getBonusAssetLabels(assessmentType: AssessmentType) {
  return getDiagnosticConfig(assessmentType).bonusAssets;
}
