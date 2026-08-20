import type { LucideIcon } from "lucide-react";
import {
  BrainCircuit,
  Building2,
  Factory,
  Globe2,
  GraduationCap,
  Search,
  ShieldCheck,
  ShoppingCart,
  Wrench
} from "lucide-react";

export const serviceSlugs = [
  "site-web",
  "commerce-electronique",
  "automatisation-ia",
  "soutien-ti",
  "formation-sur-mesure",
  "seo",
  "cybersecurite",
  "soutien-industriel",
  "solutions-entreprises"
] as const;

export type ServiceSlug = (typeof serviceSlugs)[number];

export type ServiceProcessStep = {
  readonly title: string;
  readonly description: string;
};

export type ServiceDefinition = {
  readonly slug: ServiceSlug;
  readonly href: `/services/${ServiceSlug}`;
  readonly eyebrow: string;
  readonly shortTitle: string;
  readonly title: string;
  readonly summary: string;
  readonly intro: string;
  readonly icon: LucideIcon;
  readonly seoTitle: string;
  readonly seoDescription: string;
  readonly outcomes: readonly string[];
  readonly scope: readonly string[];
  readonly process: readonly ServiceProcessStep[];
  readonly fit: readonly string[];
  readonly costNote: string;
  readonly related: readonly ServiceSlug[];
};

export const services = [
  {
    slug: "site-web",
    href: "/services/site-web",
    eyebrow: "Création et refonte",
    shortTitle: "Sites web",
    title: "Un site web utile, crédible et simple à faire évoluer",
    summary:
      "Création ou refonte d’un site clair, rapide et adapté à votre façon de travailler.",
    intro:
      "Votre site doit aider les gens à comprendre votre offre, vous joindre facilement et vous faire confiance. On choisit la technologie selon vos besoins, votre budget et l’autonomie que vous souhaitez garder.",
    icon: Globe2,
    seoTitle: "Création et refonte de sites web abordables au Québec",
    seoDescription:
      "Création et refonte de sites web pour PME et organismes au Québec: structure claire, contenu utile, performance, autonomie et coûts adaptés aux besoins.",
    outcomes: [
      "Une offre et des parcours faciles à comprendre",
      "Un site adapté au mobile, rapide et accessible",
      "Des formulaires et appels à l’action reliés à vos objectifs",
      "Une base documentée que votre équipe peut faire évoluer"
    ],
    scope: [
      "Audit d’un site existant ou cadrage d’un nouveau projet",
      "Architecture des pages, contenus prioritaires et parcours visiteurs",
      "Design, intégration et choix de plateforme adaptés au contexte",
      "Performance, SEO de base, formulaires et hygiène de confidentialité",
      "Transfert de connaissances pour les mises à jour courantes"
    ],
    process: [
      {
        title: "Comprendre",
        description:
          "On clarifie vos publics, vos objectifs, votre contenu et les irritants du site actuel."
      },
      {
        title: "Prioriser",
        description:
          "On définit une première version utile et les améliorations qui peuvent attendre."
      },
      {
        title: "Construire",
        description:
          "On valide la structure et le contenu, puis on intègre et teste le site."
      },
      {
        title: "Transmettre",
        description:
          "On documente l’essentiel et on montre à votre équipe comment rester autonome."
      }
    ],
    fit: [
      "Votre entreprise lance ou clarifie son offre",
      "Votre site actuel est lent, confus ou difficile à modifier",
      "Vos formulaires et outils travaillent chacun de leur côté",
      "Vous voulez une solution durable sans dépendance inutile"
    ],
    costNote:
      "Le périmètre est établi avec vous avant de construire. On privilégie les fonctions essentielles, la réutilisation de vos contenus et outils, puis une évolution par étapes lorsque cela réduit le risque et le coût total.",
    related: ["commerce-electronique", "seo", "formation-sur-mesure"]
  },
  {
    slug: "commerce-electronique",
    href: "/services/commerce-electronique",
    eyebrow: "Boutiques et vente en ligne",
    shortTitle: "Commerce électronique",
    title: "Une boutique en ligne simple à utiliser et à administrer",
    summary:
      "Conception ou amélioration d’une boutique adaptée à vos produits, à vos opérations et à votre capacité de gestion.",
    intro:
      "Vendre en ligne demande plus qu’un catalogue. On relie l’expérience d’achat, les paiements, les taxes, la livraison, les communications et le travail de votre équipe dans un parcours cohérent, sans ajouter des fonctions que vous ne pourrez pas maintenir.",
    icon: ShoppingCart,
    seoTitle: "Création de boutique en ligne abordable au Québec",
    seoDescription:
      "Création et amélioration de boutiques en ligne pour PME et organismes au Québec: catalogue, paiement, livraison, contenus, intégrations et transfert de connaissances.",
    outcomes: [
      "Un parcours d’achat clair sur ordinateur et sur mobile",
      "Des produits, prix et politiques faciles à comprendre",
      "Des opérations reliées aux capacités réelles de l’équipe",
      "Une administration documentée pour les tâches courantes"
    ],
    scope: [
      "Cadrage de l’offre, du catalogue et des parcours d’achat",
      "Choix ou amélioration de plateforme selon le contexte existant",
      "Configuration des produits, taxes, paiements, livraison et courriels transactionnels",
      "Connexion raisonnée aux outils de gestion, d’inventaire ou de suivi",
      "Tests, documentation et formation pour l’administration quotidienne"
    ],
    process: [
      {
        title: "Cartographier",
        description:
          "On relie les produits, les clients, les paiements, la livraison et les responsabilités internes."
      },
      {
        title: "Simplifier",
        description:
          "On choisit le parcours essentiel et les intégrations qui soutiennent vraiment les opérations."
      },
      {
        title: "Configurer",
        description:
          "On construit et teste la boutique avec des données contrôlées avant son utilisation réelle."
      },
      {
        title: "Transmettre",
        description:
          "On documente les commandes, remboursements, mises à jour de produits et situations courantes."
      }
    ],
    fit: [
      "Vous voulez commencer à vendre en ligne avec une portée raisonnable",
      "Votre boutique existe, mais son administration demande trop d’étapes manuelles",
      "Les clients comprennent mal les produits, la livraison ou les politiques",
      "Vous voulez relier la boutique aux outils existants sans tout remplacer"
    ],
    costNote:
      "On distingue la mise en place initiale des frais récurrents de plateforme, de paiement et d’extensions. Le catalogue, les modes de livraison et les intégrations sont priorisés selon leur valeur opérationnelle afin de garder le projet administrable et le coût prévisible.",
    related: ["site-web", "automatisation-ia", "seo"]
  },
  {
    slug: "automatisation-ia",
    href: "/services/automatisation-ia",
    eyebrow: "Automatisation et IA pratique",
    shortTitle: "Automatisation et IA",
    title: "Automatiser le répétitif sans perdre le contrôle",
    summary:
      "Des automatisations et usages de l’IA ciblés pour économiser du temps, avec validation humaine et règles claires.",
    intro:
      "On part du travail réel de votre équipe: doubles saisies, suivis manuels, documents répétitifs ou information difficile à retrouver. L’objectif n’est pas d’ajouter un outil de plus, mais de simplifier un processus mesurable.",
    icon: BrainCircuit,
    seoTitle: "Automatisation et intelligence artificielle pratique pour PME",
    seoDescription:
      "Accompagnement en automatisation et IA pour PME: analyse des processus, petit projet pilote, intégrations, règles de données et transfert à l’équipe.",
    outcomes: [
      "Moins de saisie répétitive et d’étapes oubliées",
      "Un processus documenté avec des responsabilités claires",
      "Des usages de l’IA encadrés par une validation humaine",
      "Une équipe capable de comprendre et ajuster la solution"
    ],
    scope: [
      "Cartographie d’un processus et mesure du temps perdu",
      "Automatisation entre formulaires, courriels, fichiers et outils existants",
      "Aide au choix d’outils sans code, intégrations ou développement ciblé",
      "Cas d’usage IA, règles de données, gabarits et validation des résultats",
      "Projet pilote, documentation et formation des personnes concernées"
    ],
    process: [
      {
        title: "Observer",
        description:
          "On suit le processus actuel et repère les répétitions, délais et risques d’erreur."
      },
      {
        title: "Choisir",
        description:
          "On retient un cas d’usage assez utile pour compter, mais assez petit pour être testé rapidement."
      },
      {
        title: "Piloter",
        description:
          "On construit une version contrôlée, avec données d’essai et points de validation."
      },
      {
        title: "Stabiliser",
        description:
          "On mesure le résultat, corrige les irritants et remet les consignes à l’équipe."
      }
    ],
    fit: [
      "Votre équipe copie la même information dans plusieurs outils",
      "Des suivis importants dépendent de rappels manuels",
      "Vous voulez essayer l’IA sans exposer vos données au hasard",
      "Vous cherchez un premier gain concret avant un projet plus large"
    ],
    costNote:
      "On commence généralement par un seul processus et un petit pilote. Vos outils et licences actuels sont évalués avant d’en proposer de nouveaux, et la solution doit demeurer compréhensible et maintenable pour justifier son coût.",
    related: ["formation-sur-mesure", "soutien-ti", "cybersecurite"]
  },
  {
    slug: "soutien-ti",
    href: "/services/soutien-ti",
    eyebrow: "Soutien informatique",
    shortTitle: "Soutien TI",
    title: "Du soutien TI compréhensible pour garder le travail en mouvement",
    summary:
      "Aide ponctuelle ou structurée pour les postes, accès, sauvegardes, outils infonuagiques et fournisseurs.",
    intro:
      "Les petites équipes ont besoin de réponses claires, pas d’un environnement plus compliqué. On aide à résoudre les irritants, à remettre de l’ordre et à documenter ce qui doit être fiable au quotidien.",
    icon: Wrench,
    seoTitle: "Soutien informatique pratique pour PME et organismes",
    seoDescription:
      "Soutien TI pour petites entreprises et organismes: postes, accès, outils infonuagiques, sauvegardes, fournisseurs et documentation claire.",
    outcomes: [
      "Des problèmes récurrents identifiés et traités à la source",
      "Des accès, appareils et responsabilités mieux organisés",
      "Des sauvegardes et procédures essentielles vérifiées",
      "Une documentation simple pour éviter de repartir de zéro"
    ],
    scope: [
      "Diagnostic d’un problème ou portrait léger de l’environnement",
      "Postes de travail, comptes, accès et outils de collaboration",
      "Sauvegardes, mises à jour et pratiques de base",
      "Coordination avec les fournisseurs Internet, logiciels ou hébergeurs",
      "Procédures de départ, d’arrivée et de récupération courante"
    ],
    process: [
      {
        title: "Trier",
        description:
          "On distingue l’urgence, la cause probable et les améliorations qui peuvent être planifiées."
      },
      {
        title: "Rétablir",
        description:
          "On remet le service en état ou coordonne la bonne ressource lorsqu’un fournisseur doit intervenir."
      },
      {
        title: "Corriger",
        description:
          "On traite la cause et les dépendances qui risquent de recréer le problème."
      },
      {
        title: "Documenter",
        description:
          "On conserve les décisions, accès et prochaines actions dans un format utilisable."
      }
    ],
    fit: [
      "Vous n’avez pas de ressource TI à l’interne",
      "Les mêmes problèmes reviennent sans explication claire",
      "Vos comptes, appareils ou fournisseurs sont difficiles à suivre",
      "Vous voulez structurer le soutien avant que l’équipe grandisse"
    ],
    costNote:
      "Le besoin est d’abord trié pour éviter de transformer un incident ponctuel en mandat trop large. Lorsque du suivi est utile, les priorités et responsabilités sont définies clairement afin de limiter les interventions répétitives.",
    related: ["cybersecurite", "formation-sur-mesure", "automatisation-ia"]
  },
  {
    slug: "formation-sur-mesure",
    href: "/services/formation-sur-mesure",
    eyebrow: "Formation et autonomie",
    shortTitle: "Formation sur mesure",
    title: "Des formations que votre équipe peut appliquer dès le lendemain",
    summary:
      "Formation pratique sur vos outils, vos procédures et vos réalités, du niveau débutant au perfectionnement.",
    intro:
      "Une bonne formation utilise les mots, les exemples et l’environnement de votre équipe. On peut adapter le contenu à une embauche, un changement d’outil ou un besoin précis, puis laisser des repères simples à consulter.",
    icon: GraduationCap,
    seoTitle: "Formation informatique sur mesure pour les équipes",
    seoDescription:
      "Formations informatiques adaptées aux équipes: Internet, IA, Excel, Word, cybersécurité, outils internes, intégration des employés et procédures spécialisées.",
    outcomes: [
      "Des exercices proches des tâches réellement effectuées",
      "Un vocabulaire accessible aux différents niveaux de l’équipe",
      "Des aide-mémoire et procédures qui restent après la séance",
      "Une base réutilisable pour l’accueil de nouvelles personnes"
    ],
    scope: [
      "Internet, outils numériques et bonnes pratiques de base",
      "Intelligence artificielle, données permises et validation des résultats",
      "Excel, Word et méthodes de travail plus efficaces",
      "Cybersécurité, hameçonnage, mots de passe et accès",
      "Formation propre à vos logiciels, procédures ou environnement"
    ],
    process: [
      {
        title: "Cibler",
        description:
          "On définit les tâches à réussir, le niveau de départ et les contraintes de l’équipe."
      },
      {
        title: "Adapter",
        description:
          "On prépare des exemples, exercices et supports reliés à votre contexte."
      },
      {
        title: "Pratiquer",
        description:
          "La séance laisse de la place aux manipulations, questions et cas réels."
      },
      {
        title: "Consolider",
        description:
          "On remet les repères utiles et identifie les points qui demandent un suivi."
      }
    ],
    fit: [
      "Vous accueillez de nouvelles personnes dans un environnement spécialisé",
      "L’équipe utilise un outil sans méthode commune",
      "Les niveaux de confiance numérique varient beaucoup",
      "Vous voulez rendre les gens plus autonomes, pas seulement présenter des fonctions"
    ],
    costNote:
      "Le contenu est dimensionné selon les compétences à acquérir, le nombre de groupes et le niveau de personnalisation. On réutilise les supports pertinents et on concentre le sur-mesure sur vos vrais exemples et procédures.",
    related: ["automatisation-ia", "soutien-ti", "soutien-industriel"]
  },
  {
    slug: "seo",
    href: "/services/seo",
    eyebrow: "SEO et stratégie numérique",
    shortTitle: "SEO pragmatique",
    title: "Être trouvé par les bonnes personnes, sans recettes opaques",
    summary:
      "Une stratégie numérique sobre: structure, contenu, performance et mesure reliés à vos objectifs d’affaires.",
    intro:
      "Le référencement utile commence par des pages qui répondent clairement aux questions de vos clients. On relie la technique, le contenu et la mesure pour choisir les actions qui ont une chance réelle d’aider.",
    icon: Search,
    seoTitle: "SEO pragmatique et stratégie numérique pour PME",
    seoDescription:
      "SEO et stratégie numérique pour PME: audit clair, pages prioritaires, contenu utile, performance, mesure et plan d’action sans promesses irréalistes.",
    outcomes: [
      "Une base technique et éditoriale plus facile à comprendre",
      "Des pages prioritaires reliées aux recherches de vos clients",
      "Un plan de contenu réaliste pour votre capacité de production",
      "Des indicateurs simples pour décider quoi poursuivre"
    ],
    scope: [
      "Audit technique, structurel et éditorial des pages importantes",
      "Intentions de recherche, offre, territoire et priorités d’affaires",
      "Titres, contenus, liens internes et données structurées de base",
      "Performance, indexation et configuration des outils de mesure",
      "Plan de contenu et suivi ponctuel ou progressif"
    ],
    process: [
      {
        title: "Établir la base",
        description:
          "On vérifie ce qui existe, ce qui est mesurable et les problèmes qui bloquent la compréhension."
      },
      {
        title: "Choisir les priorités",
        description:
          "On rapproche les besoins recherchés, vos offres et les pages capables d’y répondre."
      },
      {
        title: "Améliorer",
        description:
          "On corrige les éléments techniques et éditoriaux dans un ordre utile."
      },
      {
        title: "Apprendre",
        description:
          "On observe les signaux disponibles et ajuste le plan sans attribuer chaque variation à une seule action."
      }
    ],
    fit: [
      "Votre site existe, mais son rôle dans les ventes reste flou",
      "Les pages parlent de l’entreprise sans répondre aux questions des clients",
      "Vous publiez sans savoir quels sujets méritent l’effort",
      "Vous voulez une stratégie mesurable sans promesse de position garantie"
    ],
    costNote:
      "On corrige d’abord les fondations et les pages qui soutiennent directement votre offre. Le rythme de contenu et de suivi est ajusté à votre capacité réelle; une cadence plus grande n’est proposée que si elle peut être maintenue et mesurée.",
    related: ["site-web", "automatisation-ia", "formation-sur-mesure"]
  },
  {
    slug: "cybersecurite",
    href: "/services/cybersecurite",
    eyebrow: "Cybersécurité et hygiène numérique",
    shortTitle: "Cybersécurité",
    title: "Réduire les risques du quotidien, une priorité à la fois",
    summary:
      "Un portrait compréhensible des accès, sauvegardes, appareils et habitudes, suivi d’actions réalisables.",
    intro:
      "La sécurité devient plus abordable lorsqu’on commence par les risques les plus probables et les mesures qui protègent plusieurs situations à la fois. On explique les choix pour que l’équipe puisse les maintenir.",
    icon: ShieldCheck,
    seoTitle: "Cybersécurité et hygiène numérique pour PME",
    seoDescription:
      "Accompagnement en cybersécurité pour PME: accès, authentification multifacteur, sauvegardes, mises à jour, sensibilisation et plan d’action priorisé.",
    outcomes: [
      "Des accès critiques mieux protégés et attribués",
      "Des sauvegardes dont le fonctionnement peut être vérifié",
      "Des mises à jour et responsabilités moins ambiguës",
      "Une équipe mieux préparée aux erreurs, messages suspects et incidents"
    ],
    scope: [
      "Comptes, mots de passe, authentification multifacteur et droits d’accès",
      "Sauvegardes, restauration, appareils et mises à jour",
      "Site web, hébergement, services infonuagiques et fournisseurs",
      "Sensibilisation au hameçonnage et pratiques de travail",
      "Plan 30/90 jours et procédures essentielles"
    ],
    process: [
      {
        title: "Faire le portrait",
        description:
          "On rassemble les systèmes importants, les accès et les pratiques actuelles."
      },
      {
        title: "Évaluer",
        description:
          "On classe les constats selon leur impact, leur probabilité et l’effort nécessaire."
      },
      {
        title: "Corriger",
        description:
          "On applique ou accompagne les mesures prioritaires sans prétendre éliminer tout risque."
      },
      {
        title: "Maintenir",
        description:
          "On remet des repères simples pour revoir les accès, sauvegardes et changements."
      }
    ],
    fit: [
      "Vous ne savez pas clairement qui a accès à quoi",
      "Les sauvegardes existent, mais personne ne teste la restauration",
      "L’équipe grandit ou travaille avec plusieurs fournisseurs",
      "Vous voulez agir sans commander immédiatement un audit lourd"
    ],
    costNote:
      "On peut commencer par un diagnostic ciblé et un plan priorisé avant toute implantation. Les mesures sont proposées selon le risque et la réalité de l’organisation, en distinguant clairement les gains rapides des projets plus structurants.",
    related: ["soutien-ti", "formation-sur-mesure", "automatisation-ia"]
  },
  {
    slug: "soutien-industriel",
    href: "/services/soutien-industriel",
    eyebrow: "Milieux industriels et spécialisés",
    shortTitle: "Soutien industriel",
    title:
      "Relier le terrain, les données et les outils sans perturber les opérations",
    summary:
      "Soutien spécialisé pour documenter, former et améliorer les outils autour d’un environnement opérationnel.",
    intro:
      "Les milieux industriels et spécialisés demandent de comprendre les contraintes du terrain, les équipements, les fournisseurs et les responsabilités. On avance avec les personnes qui opèrent le système et on respecte les exigences de continuité et de sécurité.",
    icon: Factory,
    seoTitle: "Soutien informatique industriel et formation spécialisée",
    seoDescription:
      "Soutien informatique pour milieux industriels et spécialisés: documentation, données, rapports, formation du personnel, intégrations et coordination des fournisseurs.",
    outcomes: [
      "Des procédures et responsabilités plus faciles à transmettre",
      "Des données et rapports mieux reliés aux décisions du terrain",
      "Des irritants numériques priorisés sans fragiliser les opérations",
      "Une formation adaptée aux rôles et aux contraintes réelles"
    ],
    scope: [
      "Observation des processus, outils, échanges de données et dépendances",
      "Documentation d’exploitation, d’accueil et de transfert de connaissances",
      "Tableaux de suivi, formulaires, rapports et automatisations périphériques",
      "Formation propre aux rôles, procédures et environnements",
      "Coordination avec les intégrateurs, fournisseurs et responsables internes"
    ],
    process: [
      {
        title: "Comprendre le terrain",
        description:
          "On rencontre les personnes concernées et distingue les systèmes critiques des outils périphériques."
      },
      {
        title: "Délimiter",
        description:
          "On précise les contraintes, validations et responsabilités avant de proposer un changement."
      },
      {
        title: "Tester prudemment",
        description:
          "On privilégie un périmètre contrôlé, des données d’essai et un retour arrière défini."
      },
      {
        title: "Transférer",
        description:
          "On documente la solution et forme les personnes qui devront l’utiliser ou la soutenir."
      }
    ],
    fit: [
      "Vos opérations dépendent de connaissances détenues par quelques personnes",
      "Des données du terrain doivent être reprises manuellement pour les rapports",
      "Un nouvel outil exige une formation adaptée aux rôles",
      "Vous avez besoin d’un lien entre les équipes internes et des fournisseurs spécialisés"
    ],
    costNote:
      "Le mandat est découpé autour d’un besoin opérationnel précis et des contraintes de changement. On évite de remplacer un système stable sans raison démontrée et on collabore avec les spécialistes déjà en place lorsque c’est la voie la plus sûre.",
    related: [
      "solutions-entreprises",
      "formation-sur-mesure",
      "automatisation-ia"
    ]
  },
  {
    slug: "solutions-entreprises",
    href: "/services/solutions-entreprises",
    eyebrow: "Solutions pour les organisations",
    shortTitle: "Solutions pour les entreprises",
    title:
      "Relier les personnes, les processus et les outils autour d’un besoin commun",
    summary:
      "Un accompagnement transversal pour cadrer un besoin, prioriser les chantiers et faire travailler les outils ensemble.",
    intro:
      "Certains besoins ne tiennent pas dans une seule catégorie. On aide les PME et les organismes à faire le portrait de leur environnement, à choisir une séquence réaliste et à coordonner les volets Web, données, automatisation, sécurité, soutien et formation.",
    icon: Building2,
    seoTitle: "Solutions numériques adaptées aux PME et organismes",
    seoDescription:
      "Accompagnement numérique pour PME et organismes au Québec: portrait des besoins, priorités, outils, données, automatisation, sécurité et formation.",
    outcomes: [
      "Une vision commune des besoins, contraintes et responsabilités",
      "Des priorités ordonnées selon la valeur, le risque et l’effort",
      "Des outils mieux reliés au travail réel des équipes",
      "Un plan de transfert, de documentation et de soutien durable"
    ],
    scope: [
      "Portrait léger des processus, outils, données et fournisseurs",
      "Cadrage d’un besoin qui touche plusieurs équipes ou systèmes",
      "Feuille de route numérique et séquence de projets proportionnée",
      "Coordination de volets Web, automatisation, soutien, sécurité et formation",
      "Documentation des décisions, responsables et prochains points de contrôle"
    ],
    process: [
      {
        title: "Rassembler",
        description:
          "On rencontre les personnes concernées et rassemble les objectifs, irritants et dépendances."
      },
      {
        title: "Prioriser",
        description:
          "On compare les gains, les risques, les coûts et la capacité de changement de l’organisation."
      },
      {
        title: "Coordonner",
        description:
          "On avance par lots vérifiables avec les ressources internes et les fournisseurs déjà en place."
      },
      {
        title: "Ancrer",
        description:
          "On documente les décisions, forme les équipes et définit le suivi nécessaire."
      }
    ],
    fit: [
      "Plusieurs outils ou équipes sont concernés par le même problème",
      "Les priorités numériques s’accumulent sans ordre clair",
      "Vous devez choisir entre améliorer l’existant et remplacer une partie de l’environnement",
      "Vous cherchez un lien neutre entre les besoins d’affaires et les fournisseurs techniques"
    ],
    costNote:
      "Le premier mandat vise un portrait et une séquence de décisions, pas une transformation globale présumée. Chaque chantier est estimé séparément et peut être confié à ForméducWeb, à votre équipe ou à un fournisseur spécialisé selon le meilleur intérêt du projet.",
    related: ["automatisation-ia", "soutien-ti", "soutien-industriel"]
  }
] as const satisfies readonly ServiceDefinition[];

export const serviceNavigationSlugs = [
  "site-web",
  "commerce-electronique",
  "automatisation-ia",
  "soutien-ti",
  "cybersecurite",
  "formation-sur-mesure",
  "soutien-industriel",
  "solutions-entreprises"
] as const satisfies readonly ServiceSlug[];

export const serviceNavigation = serviceNavigationSlugs.map((slug) => {
  const service = services.find((candidate) => candidate.slug === slug);

  if (!service) {
    throw new Error(`Service principal introuvable: ${slug}`);
  }

  return service;
});

export const serviceCostPrinciples = [
  "Comprendre le besoin avant de recommander un outil ou une portée",
  "Réutiliser ce qui fonctionne déjà avant d’ajouter des licences",
  "Découper le travail en étapes qui produisent chacune un résultat utile",
  "Documenter et former pour réduire la dépendance aux interventions répétées"
] as const;

export function getServiceBySlug(slug: ServiceSlug): ServiceDefinition;
export function getServiceBySlug(slug: string): ServiceDefinition | undefined;
export function getServiceBySlug(slug: string): ServiceDefinition | undefined {
  return services.find((service) => service.slug === slug);
}
