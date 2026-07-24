export const assessmentTypes = ["loi25", "cybersecurity", "ai"] as const;

export type AssessmentType = (typeof assessmentTypes)[number];

export type DiagnosticContent = {
  eyebrow: string;
  title: string;
  description: string;
  badge: string;
  audience: string;
  freeDeliverables: string[];
  fullReportAdditions: string[];
  reasonsToAct: string[];
  notThis: string[];
  packages: Array<{
    name: string;
    price: string;
    summary: string;
    items: string[];
  }>;
  faq: Array<{
    question: string;
    answer: string;
  }>;
};

export type DiagnosticConfig = {
  type: AssessmentType;
  slug: string;
  label: string;
  shortLabel: string;
  themeLabel: string;
  path: string;
  wizardPath: string;
  reportPath: (token: string) => string;
  storagePrefix: string;
  leadSource: string;
  contactSource: string;
  stripeProductName: string;
  stripeDescription: string;
  pdfTitle: string;
  pdfSubject: string;
  filePrefix: string;
  resultTitle: string;
  reportTitle: string;
  disclaimerBadge: string;
  diagnosticNoun: string;
  fullReportIncludes: string[];
  bonusAssets: {
    procedureTitle: string;
    snippetTitle: string;
    procedureFilename: string;
    snippetFilename: string;
  };
  content: DiagnosticContent;
};

const diagnostics = {
  loi25: {
    type: "loi25",
    slug: "loi-25",
    label: "Loi 25",
    shortLabel: "Loi 25",
    themeLabel: "Conformité",
    path: "/loi-25",
    wizardPath: "/loi-25/wizard",
    reportPath: (token: string) => `/loi-25/rapport/${token}`,
    storagePrefix: "formeducweb-loi25",
    leadSource: "diagnostic-loi25",
    contactSource: "diagnostic-loi25",
    stripeProductName: "Kit d’exécution 90 jours — Loi 25",
    stripeDescription:
      "Plan personnalisé 90 jours, inventaire des données, registre d’incidents et procédure de demandes.",
    pdfTitle: "Kit d’exécution 90 jours — Loi 25",
    pdfSubject: "Rapport d'auto-évaluation Loi 25",
    filePrefix: "rapport-loi25",
    resultTitle: "Votre diagnostic Loi 25",
    reportTitle: "Votre diagnostic Loi 25",
    disclaimerBadge: "Diagnostic, pas avis juridique",
    diagnosticNoun: "diagnostic Loi 25",
    fullReportIncludes: [
      "Top 5 des écarts prioritaires avec le pourquoi et quoi faire",
      "Plan d’action 90 jours personnalisé avec responsables et échéances",
      "Inventaire des données et registre d’incidents éditables",
      "Procédure de demandes et textes de formulaire prêts à adapter",
      "Crédit de 29 $ valable 90 jours sur un accompagnement admissible"
    ],
    bonusAssets: {
      procedureTitle: "Procédure de demandes",
      snippetTitle: "Textes de formulaire",
      procedureFilename: "procedure-demandes-loi25.txt",
      snippetFilename: "textes-formulaire-loi25.txt"
    },
    content: {
      eyebrow: "Diagnostic Loi 25",
      badge: "Loi 25",
      title: "Diagnostic Loi 25 pour PME: données, formulaires et confiance",
      description:
        "Un parcours simple pour évaluer vos pratiques Loi 25, mieux connaître vos données, clarifier vos formulaires et prioriser les gestes qui inspirent confiance.",
      audience:
        "Directions, équipes opérations, marketing ou administration sans ressource conformité dédiée.",
      freeDeliverables: [
        "Score global et niveau de préparation.",
        "3 priorités pour démarrer sans vous disperser.",
        "Plan d'action 30 jours en langage simple.",
        "Disclaimers clairs et prochaine étape recommandée."
      ],
      fullReportAdditions: [
        "Top 5 des écarts avec impacts, actions, responsables et échéances.",
        "Plan d’exécution 90 jours personnalisé et téléchargeable.",
        "Inventaire des données et registre d’incidents éditables (XLSX).",
        "Procédure de demandes et textes de formulaire prêts à adapter (DOCX).",
        "Crédit de 29 $ valable 90 jours sur un accompagnement admissible."
      ],
      reasonsToAct: [
        "Savoir quelles données vous collectez, où elles se trouvent et pourquoi elles sont utiles.",
        "Rendre vos formulaires et votre site plus transparents pour les clients.",
        "Relier confidentialité, accès, sauvegardes et routines d'incident dans une même hygiène numérique."
      ],
      notThis: [
        "Ce n'est pas une promesse de conformité garantie.",
        "Ce n'est pas un avis juridique personnalisé.",
        "Ce n'est pas un projet lourd avant d'avoir validà vos priorités."
      ],
      packages: [
        {
          name: "Starter",
          price: "À partir de 690 $",
          summary: "Diagnostic + kit + plan d’action priorisé.",
          items: [
            "Auto-évaluation guidée",
            "Lecture du kit avec vous",
            "Plan 30/90 jours",
            "Recommandations pour vos formulaires et pages légales"
          ]
        },
        {
          name: "Pro",
          price: "À partir de 1 950 $",
          summary:
            "Implantation orientée site web, transparence et pratiques internes.",
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
          summary:
            "Suivi continu pour garder vos pratiques à jour sans vous surcharger.",
          items: [
            "Revue mensuelle des actions",
            "Support sur les changements web",
            "Mises à jour de documents",
            "Conseils sur l'évolution des pratiques"
          ]
        }
      ],
      faq: [
        {
          question: "Pourquoi commencer par un diagnostic Loi 25?",
          answer:
            "Parce qu'il permet de voir rapidement où vous avez déjà de bons réflexes et où un effort concret est requis avant d'investir partout."
        },
        {
          question: "Le kit remplace-t-il un avis juridique?",
          answer:
            "Non. Le kit sert au diagnostic, à l’alignement et à la priorisation. Une validation juridique peut rester pertinente selon votre contexte."
        },
        {
          question: "Pouvez-vous implanter les recommandations?",
          answer:
            "Oui. On peut ensuite intervenir sur votre site, vos formulaires, vos pages légales et vos pratiques techniques de base."
        }
      ]
    }
  },
  cybersecurity: {
    type: "cybersecurity",
    slug: "cybersecurite",
    label: "Cybersécurité",
    shortLabel: "Cybersécurité",
    themeLabel: "Protection",
    path: "/cybersecurite",
    wizardPath: "/cybersecurite/wizard",
    reportPath: (token: string) => `/cybersecurite/rapport/${token}`,
    storagePrefix: "formeducweb-cybersecurity",
    leadSource: "diagnostic-cybersecurite",
    contactSource: "diagnostic-cybersecurite",
    stripeProductName: "Kit d’exécution 90 jours — Cybersécurité",
    stripeDescription:
      "Plan personnalisé 90 jours, procédure d’incident, checklist accès et sauvegardes, et mémo antifraude.",
    pdfTitle: "Kit d’exécution 90 jours — Cybersécurité",
    pdfSubject: "Rapport d'auto-évaluation cybersécurité",
    filePrefix: "rapport-cybersecurite",
    resultTitle: "Votre diagnostic cybersécurité",
    reportTitle: "Votre diagnostic cybersécurité",
    disclaimerBadge: "Diagnostic, pas audit certifié",
    diagnosticNoun: "diagnostic cybersécurité",
    fullReportIncludes: [
      "Top 5 des risques prioritaires avec impact et correctif proposé",
      "Plan d’action 90 jours personnalisé avec responsables et échéances",
      "Procédure d’incident éditable",
      "Checklist accès et sauvegardes, et mémo antifraude",
      "Crédit de 29 $ valable 90 jours sur un accompagnement admissible"
    ],
    bonusAssets: {
      procedureTitle: "Procédure d’incident",
      snippetTitle: "Checklist accès et sauvegardes",
      procedureFilename: "procedure-incident-cyber.txt",
      snippetFilename: "checklist-acces-sauvegardes.txt"
    },
    content: {
      eyebrow: "Diagnostic cybersécurité",
      badge: "Cybersécurité",
      title:
        "Diagnostic cybersécurité PME: MFA, sauvegardes, accès et courriels",
      description:
        "Un diagnostic positif pour améliorer votre cybersécurité PME: MFA, sauvegardes, accès employés, appareils, courriels et réflexes d'incident.",
      audience: "PME, OBNL et équipes sans responsable sécurité à temps plein.",
      freeDeliverables: [
        "Score global de posture cyber.",
        "3 priorités concrètes à traiter d'abord.",
        "Plan d'action 30 jours pour réduire les risques courants.",
        "Suite recommandée : autonomie, kit d’exécution ou accompagnement."
      ],
      fullReportAdditions: [
        "Top 5 des risques avec impacts, actions, responsables et échéances.",
        "Plan d’exécution 90 jours personnalisé et téléchargeable.",
        "Procédure d’incident prête à adapter (DOCX).",
        "Checklist accès et sauvegardes (XLSX) et mémo antifraude (PDF).",
        "Crédit de 29 $ valable 90 jours sur un accompagnement admissible."
      ],
      reasonsToAct: [
        "Les bases bien entretenues - MFA, mises à jour, sauvegardes - réduisent beaucoup de risques courants.",
        "Un court diagnostic aide à prioriser avant d'acheter des outils ou de multiplier les mandats.",
        "Une procédure claire rend l'équipe plus calme et plus rapide quand un incident arrive."
      ],
      notThis: [
        "Ce n'est pas un test d'intrusion.",
        "Ce n'est pas une certification de sécurité.",
        "Ce n'est pas une liste d'outils à acheter sans priorisation."
      ],
      packages: [
        {
          name: "Starter",
          price: "À partir de 690 $",
          summary: "Diagnostic + plan cyber priorisé pour PME.",
          items: [
            "Lecture du questionnaire",
            "Plan 30/90 jours",
            "Priorités MFA, sauvegardes, accès et courriel",
            "Discussion avec vos responsables internes ou fournisseur TI"
          ]
        },
        {
          name: "Renforcement",
          price: "À partir de 1 950 $",
          summary: "Implantation accompagnée des mesures de base.",
          items: [
            "Activation ou vérification MFA",
            "Revue des comptes et accès",
            "Routine sauvegardes/restauration",
            "Procédure de signalement et sensibilisation courte"
          ]
        },
        {
          name: "Suivi",
          price: "À partir de 390 $ / mois",
          summary: "Cadence légère pour garder les mesures vivantes.",
          items: [
            "Revue mensuelle des actions",
            "Suivi des correctifs",
            "Mini-tests de restauration ou incident",
            "Ajustements avec vos outils existants"
          ]
        }
      ],
      faq: [
        {
          question: "Est-ce un audit de cybersécurité complet?",
          answer:
            "Non. C'est une auto-évaluation de posture pour identifier les priorités. Un audit technique ou un pentest peut venir ensuite si nécessaire."
        },
        {
          question: "Faut-il une équipe TI pour répondre?",
          answer:
            "Non. Les questions sont formulées pour les dirigeants et opérations. Vous pouvez impliquer votre fournisseur TI pour certaines réponses."
        },
        {
          question: "Pouvez-vous aider à appliquer les mesures?",
          answer:
            "Oui. On peut vous accompagner sur les mesures de base, coordonner avec votre fournisseur TI ou documenter les procédures."
        }
      ]
    }
  },
  ai: {
    type: "ai",
    slug: "intelligence-artificielle",
    label: "Intelligence artificielle",
    shortLabel: "IA",
    themeLabel: "IA en entreprise",
    path: "/intelligence-artificielle",
    wizardPath: "/intelligence-artificielle/wizard",
    reportPath: (token: string) =>
      `/intelligence-artificielle/rapport/${token}`,
    storagePrefix: "formeducweb-ai",
    leadSource: "diagnostic-ia",
    contactSource: "diagnostic-ia",
    stripeProductName: "Kit d’exécution 90 jours — Intelligence artificielle",
    stripeDescription:
      "Plan personnalisé 90 jours, charte IA éditable, registre des usages et mémo d’équipe.",
    pdfTitle: "Kit d’exécution 90 jours — Intelligence artificielle",
    pdfSubject: "Rapport d'auto-évaluation IA",
    filePrefix: "rapport-ia",
    resultTitle: "Votre diagnostic IA",
    reportTitle: "Votre diagnostic IA",
    disclaimerBadge: "Diagnostic, pas avis juridique",
    diagnosticNoun: "diagnostic IA",
    fullReportIncludes: [
      "Top 5 des écarts IA prioritaires avec le pourquoi et quoi faire",
      "Plan d’action 90 jours personnalisé avec responsables et échéances",
      "Charte IA éditable",
      "Registre des usages IA et mémo d’équipe",
      "Crédit de 29 $ valable 90 jours sur un accompagnement admissible"
    ],
    bonusAssets: {
      procedureTitle: "Charte IA éditable",
      snippetTitle: "Registre des usages IA",
      procedureFilename: "charte-ia.txt",
      snippetFilename: "registre-usages-ia.txt"
    },
    content: {
      eyebrow: "Diagnostic IA",
      badge: "IA en entreprise",
      title:
        "Diagnostic IA pour PME: charte, données sensibles et usages utiles",
      description:
        "Un diagnostic IA pour choisir les bons cas d'usage, protéger les données sensibles, poser des règles simples et former l'équipe.",
      audience:
        "PME et OBNL qui veulent utiliser l'IA de façon utile, encadrée et réaliste.",
      freeDeliverables: [
        "Score global de préparation IA.",
        "3 priorités pour encadrer les usages actuels.",
        "Plan 30 jours pour passer d'essais dispersés à une démarche claire.",
        "Prochaine étape recommandée selon votre maturité."
      ],
      fullReportAdditions: [
        "Top 5 des écarts avec impacts, actions, responsables et échéances.",
        "Plan d’exécution 90 jours personnalisé et téléchargeable.",
        "Charte IA éditable prête à adapter (DOCX).",
        "Registre des usages (XLSX) et mémo d’équipe (PDF).",
        "Crédit de 29 $ valable 90 jours sur un accompagnement admissible."
      ],
      reasonsToAct: [
        "Vos équipes utilisent peut-être déjà des outils IA sans cadre commun.",
        "Les gains viennent surtout des bons cas d'usage, pas de la mode du moment.",
        "Un minimum de règles protège les données clients, la propriété intellectuelle et la qualité."
      ],
      notThis: [
        "Ce n'est pas une promesse d'automatisation magique.",
        "Ce n'est pas une stratégie IA corporative lourde.",
        "Ce n'est pas un avis juridique sur la régulation de l'IA."
      ],
      packages: [
        {
          name: "Starter",
          price: "À partir de 690 $",
          summary: "Diagnostic + feuille de route IA simple.",
          items: [
            "Inventaire des usages actuels",
            "Priorités données, risques et productivité",
            "Plan 30/90 jours",
            "Charte IA courte"
          ]
        },
        {
          name: "Atelier",
          price: "À partir de 1 950 $",
          summary: "Cadrage des cas d'usage et formation de base.",
          items: [
            "Atelier cas d'usage",
            "Règles de données et validation humaine",
            "Gabarits de prompts et processus",
            "Formation courte pour l'équipe"
          ]
        },
        {
          name: "Accompagnement",
          price: "À partir de 390 $ / mois",
          summary: "Suivi pour transformer les essais IA en pratiques utiles.",
          items: [
            "Revue mensuelle des expérimentations",
            "Aide à documenter les usages",
            "Mesure de gains et risques",
            "Ajustement des règles internes"
          ]
        }
      ],
      faq: [
        {
          question: "Est-ce pour les entreprises qui utilisent déjà l'IA?",
          answer:
            "Oui, mais aussi pour celles qui veulent commencer. Le diagnostic aide à voir les usages actuels, les risques et les prochains essais utiles."
        },
        {
          question: "Est-ce que le diagnostic choisit un outil IA pour nous?",
          answer:
            "Pas directement. Il clarifie d'abord les besoins, les données et les règles. Le choix d'outil vient ensuite, avec plus de recul."
        },
        {
          question: "Pouvez-vous former notre équipe?",
          answer:
            "Oui. On peut aider à créer une charte courte, former l'équipe et cadrer des cas d'usage concrets."
        }
      ]
    }
  }
} satisfies Record<AssessmentType, DiagnosticConfig>;

export const diagnosticConfigs = diagnostics;

export const diagnosticList = assessmentTypes.map((type) => diagnostics[type]);

export function isAssessmentType(value: unknown): value is AssessmentType {
  return (
    typeof value === "string" &&
    assessmentTypes.includes(value as AssessmentType)
  );
}

export function normalizeAssessmentType(value: unknown): AssessmentType {
  return isAssessmentType(value) ? value : "loi25";
}

export function getDiagnosticConfig(value: unknown): DiagnosticConfig {
  return diagnostics[normalizeAssessmentType(value)];
}

export function getDiagnosticConfigBySlug(
  slug: string
): DiagnosticConfig | null {
  return diagnosticList.find((diagnostic) => diagnostic.slug === slug) ?? null;
}
