export type PracticalResourceTopic =
  | "excel-word"
  | "web"
  | "automatisation"
  | "decisions-numeriques";

export type PracticalResource = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly href: string;
  readonly topic: PracticalResourceTopic;
  readonly formatLabel: string;
  readonly actionLabel: string;
  readonly steps: readonly [string, string, string];
  readonly keywords: readonly string[];
};

// Ces ressources sont lisibles directement dans le portail. Le lien associé
// mène toujours vers une page existante; aucun fichier ou atelier n’est simulé.
export const practicalResources = [
  {
    id: "excel-liste-fiable",
    title: "Structurer une liste Excel avant d’ajouter des formules",
    description:
      "Trois repères pour obtenir un tableau plus facile à filtrer, à valider et à transmettre.",
    href: "/formations/excel-essentiel",
    topic: "excel-word",
    formatLabel: "Conseil Excel",
    actionLabel: "Approfondir avec la formation",
    steps: [
      "Donnez un nom unique et explicite à chaque colonne.",
      "Placez un seul type d’information par cellule et un élément par ligne.",
      "Transformez la plage en tableau, puis testez un filtre avant de poursuivre."
    ],
    keywords: ["Excel", "tableau", "liste", "formules", "productivité"]
  },
  {
    id: "word-document-clair",
    title: "Rendre un document Word plus clair et plus accessible",
    description:
      "Une courte routine pour améliorer la structure sans refaire toute la mise en page.",
    href: "/formations/word-documents-professionnels",
    topic: "excel-word",
    formatLabel: "Conseil Word",
    actionLabel: "Voir le parcours Word",
    steps: [
      "Utilisez les styles Titre 1, Titre 2 et Normal plutôt qu’une mise en forme manuelle.",
      "Donnez un texte de remplacement utile aux images qui transmettent une information.",
      "Vérifiez l’ordre des titres et les contrastes avant l’exportation en PDF."
    ],
    keywords: ["Word", "documents", "accessibilité", "styles", "PDF"]
  },
  {
    id: "web-preparer-refonte",
    title: "Préparer une refonte Web sans commencer par la technologie",
    description:
      "Un point de départ pour clarifier le rôle du site avant de comparer les plateformes.",
    href: "/services/site-web",
    topic: "web",
    formatLabel: "Repère Web",
    actionLabel: "Découvrir le service Web",
    steps: [
      "Nommez les trois actions les plus importantes que le visiteur doit pouvoir accomplir.",
      "Repérez les contenus fiables à conserver et les pages qui ne servent plus.",
      "Listez les personnes qui devront mettre le site à jour après la refonte."
    ],
    keywords: ["site Web", "refonte", "contenu", "architecture", "PME"]
  },
  {
    id: "automatisation-premier-processus",
    title: "Choisir un premier processus à automatiser",
    description:
      "Une façon prudente de trouver un gain mesurable sans transformer toutes les méthodes de travail à la fois.",
    href: "/services/automatisation-ia",
    topic: "automatisation",
    formatLabel: "Mini-méthode",
    actionLabel: "Explorer l’automatisation et l’IA",
    steps: [
      "Choisissez une tâche fréquente, stable et facile à observer.",
      "Mesurez le temps, les reprises et les erreurs pendant une courte période.",
      "Testez un petit flux avec une validation humaine et un retour arrière clair."
    ],
    keywords: [
      "automatisation",
      "processus",
      "IA",
      "tâches répétitives",
      "validation"
    ]
  },
  {
    id: "decision-comparer-outil",
    title: "Comparer un nouvel outil numérique en cinq questions",
    description:
      "Des critères simples pour regarder au-delà de la démonstration et du prix affiché.",
    href: "/services/solutions-entreprises",
    topic: "decisions-numeriques",
    formatLabel: "Aide à la décision",
    actionLabel: "Voir les solutions pour les entreprises",
    steps: [
      "Vérifiez quel problème précis l’outil doit régler et pour quelles personnes.",
      "Comparez le coût total, les données, les intégrations, le soutien et la possibilité de partir.",
      "Faites un essai limité avec des critères de réussite définis avant l’achat."
    ],
    keywords: ["outil numérique", "achat", "comparaison", "coût", "entreprise"]
  }
] as const satisfies readonly PracticalResource[];

export function getPracticalResourcesByTopic(topic: PracticalResourceTopic) {
  return practicalResources.filter((resource) => resource.topic === topic);
}
