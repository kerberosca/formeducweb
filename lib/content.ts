import {
  ShieldCheck,
  Globe,
  Search,
  Network,
  FileText,
  Rocket,
  ClipboardCheck,
  Lock
} from "lucide-react";

export const homeHighlights = [
  {
    title: "Loi 25",
    description:
      "Diagnostic simple, rapport clair et plan d’action réaliste pour savoir où concentrer vos efforts.",
    href: "/loi-25",
    icon: ShieldCheck
  },
  {
    title: "Sites Web",
    description:
      "Création ou refonte orientée confiance, performance et formulaires propres à vos objectifs.",
    href: "/services/site-web",
    icon: Globe
  },
  {
    title: "Cyber & réseaux",
    description:
      "Audit léger pour PME afin d’améliorer les accès, les sauvegardes et l’hygiène opérationnelle.",
    href: "/services/cybersecurite",
    icon: Network
  }
];

export const homeHowItWorks = [
  {
    title: "Répondez au diagnostic",
    description:
      "Une auto-évaluation structurée par section pour faire ressortir vos forces et vos angles morts."
  },
  {
    title: "Recevez votre rapport",
    description:
      "Score global, niveau, priorités, écarts majeurs et plan 30/90 jours en langage simple."
  },
  {
    title: "Passez à l’implantation",
    description:
      "On vous accompagne ensuite pour les pages légales, les formulaires, la sécurité et le suivi."
  }
];

export const homeFaq = [
  {
    question: "Est-ce que l’auto-évaluation remplace un avis juridique?",
    answer:
      "Non. L’outil sert à établir un diagnostic et à prioriser un plan d’action. Une validation juridique peut être nécessaire selon votre réalité."
  },
  {
    question: "Combien de temps faut-il prévoir?",
    answer:
      "L’assistant prend généralement entre 8 et 12 minutes. Le rapport est généré à la fin de la soumission."
  },
  {
    question: "Est-ce adapté aux PME et OBNL?",
    answer:
      "Oui. Le vocabulaire, les recommandations et les priorités sont pensés pour des équipes qui n’ont pas toujours une ressource TI interne."
  },
  {
    question: "Travaillez-vous seulement avec WordPress?",
    answer:
      "WordPress est une spécialité, mais on peut aussi conseiller des alternatives selon les besoins, le budget et l’autonomie souhaitée."
  }
];

export const loi25Packages = [
  {
    name: "Starter",
    price: "À partir de 690 $",
    summary: "Diagnostic + rapport + plan d’action priorisé.",
    items: [
      "Auto-évaluation guidée",
      "Lecture du rapport avec vous",
      "Plan 30/90 jours",
      "Recommandations pour vos formulaires et pages légales"
    ]
  },
  {
    name: "Pro",
    price: "À partir de 1 950 $",
    summary:
      "Implantation orientée WordPress, transparence et mécanismes de consentement selon votre contexte.",
    items: [
      "Mise à jour des pages légales",
      "Ajustement des formulaires",
      "Révision des outils de suivi/cookies si applicable",
      "Documentation légère remise à votre équipe"
    ]
  },
  {
    name: "Accompagnement",
    price: "À partir de 390 $ / mois",
    summary: "Suivi continu pour garder vos pratiques à jour sans vous surcharger.",
    items: [
      "Revue mensuelle des actions",
      "Support sur les changements web",
      "Mises à jour de documents",
      "Conseils sur l’évolution des pratiques"
    ]
  }
];

export const loi25Faq = [
  {
    question: "Pourquoi commencer par un diagnostic?",
    answer:
      "Parce qu’il permet de voir rapidement où vous avez de bons réflexes et où un effort concret est requis avant d’investir du temps partout."
  },
  {
    question: "Quels risques cherchez-vous à réduire?",
    answer:
      "Surtout les écarts liés à la collecte, aux formulaires, aux accès, aux sauvegardes, à la documentation et à la capacité de réagir à un incident."
  },
  {
    question: "Le rapport inclut quoi exactement?",
    answer:
      "Un score global, des scores par section, les principaux écarts, un plan 30 jours, un plan 90 jours et des avertissements sur les limites du diagnostic."
  },
  {
    question: "Pouvez-vous implanter les recommandations?",
    answer:
      "Oui. On peut ensuite intervenir sur votre site, vos formulaires, vos pages légales et vos pratiques techniques de base."
  },
  {
    question: "Est-ce que vous installez des trackers?",
    answer:
      "Non par défaut. L’approche vise d’abord la sobriété, la transparence et le contrôle des outils déjà en place."
  },
  {
    question: "Comment se déroule l’appel de 20 minutes?",
    answer:
      "On passe les constats principaux, on valide le contexte de votre entreprise et on propose la prochaine meilleure étape, sans pression."
  }
];

export const servicesOverview = [
  {
    slug: "site-web",
    title: "Création et refonte de site web",
    icon: Rocket,
    summary:
      "Sites WordPress ou alternatives modernes pour présenter, convertir et simplifier vos opérations."
  },
  {
    slug: "seo",
    title: "SEO pragmatique",
    icon: Search,
    summary:
      "Structure, contenu et performance pour aider votre site à être trouvé sans stratégie opaque."
  },
  {
    slug: "cybersecurite",
    title: "Audit cyber & réseau PME",
    icon: Lock,
    summary:
      "Lecture claire des accès, sauvegardes, mises à jour et points faibles les plus fréquents."
  }
];

export const serviceDetails = {
  "site-web": {
    eyebrow: "Création / refonte",
    title: "Un site web crédible, utile et plus facile à maintenir",
    intro:
      "On conçoit des sites qui inspirent confiance, soutiennent vos ventes et s’alignent avec vos obligations de transparence.",
    bullets: [
      "Audit de l’existant ou cadrage d’un nouveau site",
      "WordPress sur mesure ou alternative adaptée au budget",
      "Formulaires propres, pages légales et architecture claire",
      "Formation légère pour rester autonome après la mise en ligne"
    ],
    deliverables: [
      "Arborescence et maquettes clés",
      "Pages conversion, SEO de base et contenus structurés",
      "Intégration des formulaires et appels à l’action",
      "Guide d’entretien et plan d’évolution"
    ],
    process: [
      "Atelier de découverte et priorités d’affaires",
      "Prototype visuel et validation de contenu",
      "Intégration, révision, optimisation et mise en ligne"
    ]
  },
  seo: {
    eyebrow: "SEO",
    title: "Une visibilité organique qui commence par une base solide",
    intro:
      "Le SEO utile, c’est d’abord un site rapide, compréhensible et structuré pour répondre à de vraies recherches.",
    bullets: [
      "Audit technique et éditorial simple à lire",
      "Plan de pages et d’expressions prioritaires",
      "Réécriture ou cadrage de contenu clé",
      "Suivi sans jargon ni promesses irréalistes"
    ],
    deliverables: [
      "Diagnostic SEO initial",
      "Optimisation on-page des pages clés",
      "Recommandations de performance et maillage",
      "Plan de contenu actionnable"
    ],
    process: [
      "Lecture de votre marché et de vos pages existantes",
      "Priorisation des gains rapides",
      "Implantation et suivi mensuel ou ponctuel"
    ]
  },
  cybersecurite: {
    eyebrow: "Cyber & réseau",
    title: "Des mesures concrètes pour réduire les risques du quotidien",
    intro:
      "Sans vous noyer dans des audits hors de portée, on cible les accès, les sauvegardes, les mises à jour et les pratiques qui comptent.",
    bullets: [
      "Vérification MFA, comptes partagés et accès excessifs",
      "Revue des sauvegardes, restaurations et points uniques de défaillance",
      "Lecture rapide des outils web, hébergement et administration",
      "Plan de correctifs priorisés pour PME"
    ],
    deliverables: [
      "Constats priorisés par impact",
      "Mesures 30/90 jours",
      "Recommandations pour le site, le cloud et l’équipe",
      "Aide à documenter les bonnes pratiques"
    ],
    process: [
      "Collecte d’information et mini-audit",
      "Lecture des risques les plus probables",
      "Remise d’un plan simple à exécuter"
    ]
  }
} as const;

export const aboutValues = [
  {
    title: "Clarté",
    description:
      "On vulgarise les enjeux pour que vous puissiez décider rapidement, même sans équipe TI interne."
  },
  {
    title: "Sobriété",
    description:
      "Pas de gadgets, pas de trackers ajoutés par défaut, pas de promesses exagérées. Juste ce qu’il faut, bien fait."
  },
  {
    title: "Implantation",
    description:
      "Un bon diagnostic vaut surtout par sa capacité à mener à des actions concrètes sur votre site et vos pratiques."
  }
];

export const legalDisclaimers = [
  "Le diagnostic Loi 25 vise l’alignement, la préparation et la priorisation d’actions.",
  "Il ne constitue pas un avis juridique et ne doit pas être présenté comme une garantie de conformité.",
  "Les recommandations doivent être adaptées à votre contexte d’affaires, vos systèmes et vos fournisseurs."
];

export const contactReasons = [
  "Diagnostic Loi 25",
  "Création ou refonte de site web",
  "SEO",
  "Audit cyber / réseau",
  "Autre besoin"
];

export const trustSignals = [
  {
    label: "Rapport 30/90 jours",
    icon: ClipboardCheck
  },
  {
    label: "Pages légales claires",
    icon: FileText
  },
  {
    label: "Approche sans trackers par défaut",
    icon: ShieldCheck
  }
];
