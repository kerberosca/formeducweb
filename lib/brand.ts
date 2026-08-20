export const brandFoundation = {
  mission:
    "Démocratiser l’utilisation du numérique en offrant aux organisations des solutions, des formations et du soutien adaptés à leurs besoins réels, à des coûts raisonnables.",
  vision:
    "Des organisations capables de comprendre leurs outils, de faire de meilleurs choix et d’utiliser la technologie avec confiance et autonomie.",
  promise:
    "Comprendre le besoin, comparer les options et mettre en place une solution utile sans créer de dépendance inutile."
} as const;

export const brandOrigin = {
  title: "Rendre le numérique plus facile à comprendre et à faire vivre",
  paragraphs: [
    "ForméducWeb prend forme autour d’un constat simple : les petites organisations doivent souvent choisir et utiliser des outils numériques sans disposer d’une équipe spécialisée pour les guider.",
    "L’entreprise relie donc formation, création Web, automatisation et accompagnement technique dans une même démarche : comprendre le travail réel, choisir une solution proportionnée, puis transmettre les connaissances nécessaires pour la suite."
  ]
} as const;

export const brandExpertise = [
  "Informatique et soutien technique",
  "Création Web et commerce électronique",
  "Formation et transfert de connaissances",
  "Automatisation et intelligence artificielle",
  "Cybersécurité et hygiène numérique",
  "Environnements d’entreprise et industriels"
] as const;

export const trainingRole = {
  title: "La formation fait partie de la solution",
  description:
    "Une technologie devient vraiment utile lorsque les personnes comprennent son rôle, savent l’utiliser avec confiance et disposent de repères pour résoudre les situations courantes. La formation est donc intégrée aux projets et offerte comme parcours autonome ou sur mesure."
} as const;

export type FounderProfile = {
  readonly name: string;
  readonly role: string;
  readonly biography: string;
  readonly expertise: readonly [string, ...string[]];
  readonly photoSrc: string;
  readonly photoAlt: string;
};

// Renseigner ce profil uniquement lorsque tous les éléments ont été confirmés.
// La page À propos ne rend jamais un profil partiel.
export const founderProfile: FounderProfile | null = null;

export function hasCompleteFounderProfile(
  profile: FounderProfile | null
): profile is FounderProfile {
  return Boolean(
    profile?.name.trim() &&
    profile.role.trim() &&
    profile.biography.trim() &&
    profile.expertise.length > 0 &&
    profile.expertise.every((item) => item.trim()) &&
    profile.photoSrc.trim() &&
    profile.photoAlt.trim()
  );
}

export const brandValues = [
  {
    id: "simplicite",
    name: "Simplicité",
    description:
      "Réduire la complexité, expliquer les choix clairement et construire une prochaine étape que l’équipe peut réellement appliquer."
  },
  {
    id: "accessibilite",
    name: "Accessibilité",
    description:
      "Rendre les outils, les connaissances et les services numériques accessibles, autant dans leur usage que dans leur coût."
  },
  {
    id: "autonomie",
    name: "Autonomie",
    description:
      "Transmettre les connaissances et documenter le travail pour que le client puisse continuer une partie du chemin par lui-même."
  },
  {
    id: "transparence",
    name: "Transparence",
    description:
      "Présenter les options, les limites, les responsabilités et les coûts connus avant de recommander une solution."
  },
  {
    id: "securite",
    name: "Sécurité",
    description:
      "Intégrer la protection des données, la confidentialité et la validation humaine aux décisions, sans recourir à la peur."
  },
  {
    id: "pragmatisme",
    name: "Pragmatisme",
    description:
      "Choisir ce qui apporte une valeur réelle, réutiliser ce qui fonctionne déjà et avancer à une échelle raisonnable."
  },
  {
    id: "education",
    name: "Éducation",
    description:
      "Donner les repères qui permettent de comprendre un outil, de poser de meilleures questions et de faire des choix plus éclairés."
  },
  {
    id: "accompagnement-humain",
    name: "Accompagnement humain",
    description:
      "Construire avec les personnes qui connaissent le terrain, respecter leur rythme et garder le jugement humain au centre des solutions."
  }
] as const;

export const brandCommitments = [
  {
    title: "Des coûts expliqués",
    description:
      "Présenter les options, les compromis et les frais récurrents connus avant de recommander une mise en place."
  },
  {
    title: "Une solution proportionnée",
    description:
      "Commencer par le besoin et la capacité d’exécution plutôt que par l’outil le plus imposant."
  },
  {
    title: "Une autonomie planifiée",
    description:
      "Prévoir la documentation, la formation et le transfert de connaissances comme une partie du résultat."
  }
] as const;

export const brandMethod = [
  {
    number: "01",
    title: "Comprendre",
    description:
      "Clarifier le besoin, les personnes concernées, les irritants, les outils déjà en place et le budget disponible."
  },
  {
    number: "02",
    title: "Comparer",
    description:
      "Examiner les options réalistes, y compris la réutilisation de l’existant, puis expliquer leurs coûts et leurs limites."
  },
  {
    number: "03",
    title: "Mettre en place",
    description:
      "Construire ou configurer la solution par étapes vérifiables, en gardant l’usage quotidien au centre."
  },
  {
    number: "04",
    title: "Transmettre",
    description:
      "Documenter l’essentiel, former les personnes concernées et convenir du soutien réellement utile pour la suite."
  }
] as const;
