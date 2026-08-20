export const contactReasons = [
  "Création ou refonte de site Web",
  "Boutique en ligne",
  "Automatisation ou intelligence artificielle",
  "Formation individuelle",
  "Formation d’équipe ou sur mesure",
  "Soutien informatique",
  "Cybersécurité générale",
  "Solution numérique pour l’industrie",
  "Diagnostic Loi 25",
  "Diagnostic cybersécurité",
  "Diagnostic IA en entreprise",
  "Accompagnement ou implantation",
  "Autre besoin"
] as const;

export type ContactReason = (typeof contactReasons)[number];

export const defaultContactReason: ContactReason = contactReasons[0];

const sourceRules: ReadonlyArray<{
  matches: (source: string) => boolean;
  reason: ContactReason;
}> = [
  {
    matches: (source) =>
      source.includes("commerce-electronique") || source.includes("boutique"),
    reason: "Boutique en ligne"
  },
  {
    matches: (source) =>
      source.includes("appel-service-cybersecurite") ||
      source.includes("appel-cout-cybersecurite"),
    reason: "Cybersécurité générale"
  },
  {
    matches: (source) => source.includes("loi25"),
    reason: "Diagnostic Loi 25"
  },
  {
    matches: (source) => source.includes("cybersecurite"),
    reason: "Diagnostic cybersécurité"
  },
  {
    matches: (source) => source.includes("diagnostic-ia"),
    reason: "Diagnostic IA en entreprise"
  },
  {
    matches: (source) =>
      source.includes("formation-sur-mesure") || source.includes("equipe"),
    reason: "Formation d’équipe ou sur mesure"
  },
  {
    matches: (source) => source.includes("formation"),
    reason: "Formation individuelle"
  },
  {
    matches: (source) => source.includes("site-web"),
    reason: "Création ou refonte de site Web"
  },
  {
    matches: (source) =>
      source.includes("automatisation") || source.includes("ia"),
    reason: "Automatisation ou intelligence artificielle"
  },
  {
    matches: (source) => source.includes("soutien") || source.includes("ti"),
    reason: "Soutien informatique"
  },
  {
    matches: (source) => source.includes("industri"),
    reason: "Solution numérique pour l’industrie"
  },
  {
    matches: (source) => source.includes("appel"),
    reason: "Accompagnement ou implantation"
  }
];

export function getContactReasonFromSource(
  value: string | null | undefined
): ContactReason | undefined {
  if (!value) return undefined;
  const source = value.normalize("NFKC").trim().toLowerCase().slice(0, 300);
  return sourceRules.find((rule) => rule.matches(source))?.reason;
}

export function isContactReason(value: unknown): value is ContactReason {
  return (
    typeof value === "string" &&
    (contactReasons as readonly string[]).includes(value)
  );
}
