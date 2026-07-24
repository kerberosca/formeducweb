import fs from "node:fs/promises";
import path from "node:path";

import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";

import type { AssessmentType } from "@/lib/diagnostics";
import type { HydratedAssessment } from "@/lib/assessment-store";

export const kitAssetIds = [
  "ai-charter",
  "ai-register",
  "ai-team-memo",
  "cyber-incident-procedure",
  "cyber-access-backup-checklist",
  "cyber-antifraud-memo",
  "loi25-data-inventory",
  "loi25-incident-register",
  "loi25-request-procedure"
] as const;

export type KitAssetId = (typeof kitAssetIds)[number];

type KitAsset = {
  id: KitAssetId;
  assessmentType: AssessmentType;
  label: string;
  description: string;
  templateFilename: string;
  downloadFilename: string;
  contentType: string;
};

export const KIT_ASSETS: readonly KitAsset[] = [
  {
    id: "ai-charter",
    assessmentType: "ai",
    label: "Charte IA éditable",
    description: "Règles, usages permis, données interdites et validation.",
    templateFilename: "charte-ia-editable.docx",
    downloadFilename: "charte-ia-90-jours.docx",
    contentType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  },
  {
    id: "ai-register",
    assessmentType: "ai",
    label: "Registre des usages IA",
    description: "Suivi des cas d’usage, données, validations et décisions.",
    templateFilename: "registre-usages-ia.xlsx",
    downloadFilename: "registre-usages-ia.xlsx",
    contentType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  },
  {
    id: "ai-team-memo",
    assessmentType: "ai",
    label: "Mémo équipe IA",
    description: "Sept réflexes et un mini-test avant publication.",
    templateFilename: "memo-equipe-ia.docx",
    downloadFilename: "memo-equipe-ia.docx",
    contentType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  },
  {
    id: "cyber-incident-procedure",
    assessmentType: "cybersecurity",
    label: "Procédure d’incident",
    description: "Signalement, confinement, reprise et retour d’expérience.",
    templateFilename: "procedure-incident-cyber.docx",
    downloadFilename: "procedure-incident-cyber.docx",
    contentType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  },
  {
    id: "cyber-access-backup-checklist",
    assessmentType: "cybersecurity",
    label: "Checklist accès et sauvegardes",
    description:
      "Contrôles, responsables, preuves et prochaines vérifications.",
    templateFilename: "checklist-acces-sauvegardes.xlsx",
    downloadFilename: "checklist-acces-sauvegardes.xlsx",
    contentType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  },
  {
    id: "cyber-antifraud-memo",
    assessmentType: "cybersecurity",
    label: "Mémo antifraude",
    description: "Signaux d’alerte et règle de confirmation sur deux canaux.",
    templateFilename: "memo-antifraude.docx",
    downloadFilename: "memo-antifraude.docx",
    contentType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  },
  {
    id: "loi25-data-inventory",
    assessmentType: "loi25",
    label: "Inventaire des données",
    description: "Finalités, systèmes, accès, conservation et sensibilité.",
    templateFilename: "inventaire-donnees-loi25.xlsx",
    downloadFilename: "inventaire-donnees-loi25.xlsx",
    contentType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  },
  {
    id: "loi25-incident-register",
    assessmentType: "loi25",
    label: "Registre d’incidents",
    description: "Faits, évaluation, notifications et actions préventives.",
    templateFilename: "registre-incidents-loi25.xlsx",
    downloadFilename: "registre-incidents-loi25.xlsx",
    contentType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  },
  {
    id: "loi25-request-procedure",
    assessmentType: "loi25",
    label: "Procédure de demandes et textes",
    description: "Traitement des demandes et textes de formulaire à adapter.",
    templateFilename: "procedure-demandes-loi25.docx",
    downloadFilename: "procedure-demandes-loi25.docx",
    contentType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  }
];

export function isKitAssetId(value: unknown): value is KitAssetId {
  return (
    typeof value === "string" &&
    (kitAssetIds as readonly string[]).includes(value)
  );
}

export function getKitAsset(id: KitAssetId) {
  return KIT_ASSETS.find((asset) => asset.id === id) as KitAsset;
}

export function getKitAssetsForType(assessmentType: AssessmentType) {
  return KIT_ASSETS.filter((asset) => asset.assessmentType === assessmentType);
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildKitReplacements(hydrated: HydratedAssessment) {
  const { assessment } = hydrated;
  const firstAction =
    hydrated.fullReport.topGaps[0]?.action ||
    hydrated.fullReport.plan30Days[0] ||
    "Choisir une première action, un responsable et une date de vérification.";

  return {
    "{{COMPANY_NAME}}": assessment.companyName || "Votre organisation",
    "{{CONTACT_NAME}}": assessment.contactName || "Responsable à désigner",
    "{{GENERATED_DATE}}": new Date().toLocaleDateString("fr-CA"),
    "{{TOP_ACTION_1}}": firstAction
  };
}

export async function renderPersonalizedKitAsset(
  asset: KitAsset,
  replacements: Record<string, string>
) {
  const templatePath = path.join(
    process.cwd(),
    "assets",
    "kit-templates",
    asset.templateFilename
  );
  const template = new Uint8Array(await fs.readFile(templatePath));
  const archive = unzipSync(template);

  for (const [entryName, bytes] of Object.entries(archive)) {
    if (!entryName.endsWith(".xml") && !entryName.endsWith(".rels")) {
      continue;
    }

    let xml = strFromU8(bytes);
    let changed = false;
    for (const [placeholder, value] of Object.entries(replacements)) {
      if (!xml.includes(placeholder)) continue;
      xml = xml.split(placeholder).join(escapeXml(value));
      changed = true;
    }
    if (changed) archive[entryName] = strToU8(xml);
  }

  return zipSync(archive, { level: 6 });
}
