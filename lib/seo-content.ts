import type { AssessmentType } from "@/lib/diagnostics";

export type SeoSupportTheme = "hygiene" | "loi25" | "cybersecurity" | "ai";

export type SeoSupportPage = {
  theme: SeoSupportTheme;
  slug: string;
  path: string;
  eyebrow: string;
  title: string;
  shortTitle: string;
  description: string;
  primaryKeyword: string;
  updatedAt: string;
  readingTime: string;
  summary: string;
  takeaways: string[];
  sections: Array<{
    heading: string;
    body: string[];
    bullets?: string[];
  }>;
  faq: Array<{
    question: string;
    answer: string;
  }>;
  primaryCtaHref: string;
  primaryCtaLabel: string;
  secondaryCtaHref: string;
  secondaryCtaLabel: string;
  relatedPaths: string[];
};

export const seoThemeLabels: Record<SeoSupportTheme, string> = {
  hygiene: "Hygiène informatique",
  loi25: "Loi 25",
  cybersecurity: "Cybersécurité",
  ai: "Intelligence artificielle"
};

export const seoThemeLandingPaths: Record<SeoSupportTheme, string> = {
  hygiene: "/hygiene-informatique",
  loi25: "/loi-25",
  cybersecurity: "/cybersecurite",
  ai: "/intelligence-artificielle"
};

const defaultUpdatedAt = "2026-07-02";

export const seoSupportPages: SeoSupportPage[] = [
  {
    theme: "hygiene",
    slug: "10-gestes",
    path: "/hygiene-informatique/10-gestes",
    eyebrow: "Hygiène informatique",
    title: "Sécurité informatique PME: 10 gestes simples pour protéger vos données",
    shortTitle: "10 gestes essentiels",
    description:
      "Dix gestes simples pour améliorer la sécurité informatique d'une PME: données, accès, sauvegardes, courriels, IA et confiance client.",
    primaryKeyword: "sécurité informatique PME",
    updatedAt: defaultUpdatedAt,
    readingTime: "6 min",
    summary:
      "Une bonne hygiène informatique repose sur des gestes répétés, visibles et faciles à expliquer. L'objectif n'est pas de tout sécuriser parfaitement, mais de réduire les irritants, clarifier les responsabilités et créer une base de confiance.",
    takeaways: [
      "Mieux connaître les données et les accès réduit les erreurs du quotidien.",
      "Les sauvegardes, MFA et mises à jour protègent sans immobiliser l'équipe.",
      "Une charte IA courte aide à profiter des outils sans exposer les informations sensibles."
    ],
    sections: [
      {
        heading: "Commencer par ce qui donne du contrôle",
        body: [
          "Pour une PME, l'hygiène informatique commence souvent par une question simple: sait-on où sont les données importantes et qui peut y accéder? Cette visibilité rend les décisions plus rapides et évite les corrections improvisées.",
          "Un inventaire léger des formulaires, fichiers clients, outils infonuagiques, comptes administrateurs et usages IA donne déjà un portrait utile. Il devient ensuite possible de prioriser les actions sans lancer un projet trop lourd."
        ],
        bullets: [
          "Lister les outils qui contiennent des renseignements personnels.",
          "Identifier les comptes administrateurs et les accès partagés.",
          "Repérer les données qui ne sont plus utiles."
        ]
      },
      {
        heading: "Installer les bons réflexes d'équipe",
        body: [
          "Les meilleurs gains viennent souvent de gestes très concrets: activer la MFA, tester une restauration, fermer les comptes des anciens employés, vérifier les mises à jour et savoir quoi faire devant un courriel suspect.",
          "Ces gestes sont positifs parce qu'ils rendent l'entreprise plus calme. Les employés savent quoi faire, les dirigeants voient les priorités et les clients sentent que leurs informations sont traitées avec sérieux."
        ],
        bullets: [
          "Activer la MFA sur les comptes importants.",
          "Tester au moins une restauration de sauvegarde.",
          "Documenter une procédure courte de signalement d'incident."
        ]
      },
      {
        heading: "Inclure l'IA dans l'hygiène numérique",
        body: [
          "L'IA fait maintenant partie de l'environnement numérique. Une bonne hygiène informatique inclut donc les données qu'on ne doit pas coller dans un outil, les résultats à vérifier et les cas d'usage à encourager.",
          "Le but n'est pas de freiner l'équipe. C'est de créer un cadre simple pour utiliser l'IA avec plus de confiance, de qualité et de respect des informations sensibles."
        ]
      }
    ],
    faq: [
      {
        question: "Qu'est-ce que l'hygiène informatique pour une PME?",
        answer:
          "C'est l'ensemble des habitudes qui gardent les données, les accès, les appareils, les sauvegardes et les outils numériques sous contrôle."
      },
      {
        question: "Faut-il tout corriger en même temps?",
        answer:
          "Non. Le bon départ est un diagnostic court, puis un plan 30/90 jours avec quelques actions à fort impact."
      }
    ],
    primaryCtaHref: "/#diagnostics",
    primaryCtaLabel: "Choisir un diagnostic",
    secondaryCtaHref: "/contact?source=seo-hygiene-10-gestes",
    secondaryCtaLabel: "Parler de mon contexte",
    relatedPaths: ["/loi-25/inventaire-donnees", "/cybersecurite/mfa-pme", "/intelligence-artificielle/charte-ia-pme"]
  },
  {
    theme: "hygiene",
    slug: "score-hygiene-informatique-pme",
    path: "/hygiene-informatique/score-hygiene-informatique-pme",
    eyebrow: "Diagnostic",
    title: "Diagnostic cybersécurité PME: lire un score sans se compliquer",
    shortTitle: "Score hygiène PME",
    description:
      "Comment lire un score de cybersécurité PME pour prioriser les données, accès, sauvegardes, courriels et usages IA.",
    primaryKeyword: "diagnostic cybersécurité PME",
    updatedAt: defaultUpdatedAt,
    readingTime: "5 min",
    summary:
      "Un score d'hygiène informatique est utile s'il aide à décider quoi faire ensuite. Il doit traduire les pratiques numériques en priorités claires, pas donner une note abstraite.",
    takeaways: [
      "Le score doit séparer les thèmes: données, accès, sauvegardes, incidents et IA.",
      "Un score faible n'est pas un échec; c'est une carte des prochaines actions.",
      "La progression compte plus que la perfection."
    ],
    sections: [
      {
        heading: "Mesurer pour décider",
        body: [
          "Un bon score aide une direction à voir où l'organisation est solide et où elle dépend encore de chance, de mémoire ou d'habitudes informelles.",
          "Le score devient vraiment utile quand il mène à trois priorités concrètes: par exemple activer la MFA, revoir les formulaires ou créer une charte IA courte."
        ]
      },
      {
        heading: "Lire le score par thème",
        body: [
          "Loi 25, cybersécurité et IA ne se mesurent pas de la même façon, mais ils se croisent. Une donnée mal classée peut devenir un risque de confidentialité, un risque cyber et un risque d'utilisation IA.",
          "C'est pour cette raison que le diagnostic doit montrer le portrait global et les écarts par thème."
        ],
        bullets: [
          "Données: collecte, conservation, transparence.",
          "Cyber: accès, MFA, sauvegardes, courriel.",
          "IA: cas d'usage, données sensibles, validation humaine."
        ]
      },
      {
        heading: "Transformer la note en plan 30/90 jours",
        body: [
          "La valeur du score vient du plan qui suit. Une action de 30 jours doit être assez claire pour commencer sans comité. Une action de 90 jours peut demander plus de coordination, mais elle doit rester réaliste."
        ]
      }
    ],
    faq: [
      {
        question: "Un score d'hygiène informatique est-il une certification?",
        answer:
          "Non. C'est un outil de priorisation. Il ne remplace pas un audit, une certification ou un avis juridique."
      },
      {
        question: "Quel est un bon score pour commencer?",
        answer:
          "Le meilleur score initial est celui qui révèle clairement les trois prochaines actions à poser."
      }
    ],
    primaryCtaHref: "/#diagnostics",
    primaryCtaLabel: "Obtenir mon score",
    secondaryCtaHref: "/contact?source=seo-score-hygiene",
    secondaryCtaLabel: "Demander conseil",
    relatedPaths: ["/hygiene-informatique/10-gestes", "/cybersecurite/sauvegardes-restauration", "/loi-25/resume-loi-25"]
  },
  {
    theme: "hygiene",
    slug: "confiance-client",
    path: "/hygiene-informatique/confiance-client",
    eyebrow: "Confiance",
    title: "Protection des données clients: un avantage de confiance pour les PME",
    shortTitle: "Confiance client",
    description:
      "Pourquoi la protection des données clients aide les PME à inspirer confiance, répondre plus vite et mieux gérer les informations confiées.",
    primaryKeyword: "protection données clients PME",
    updatedAt: defaultUpdatedAt,
    readingTime: "5 min",
    summary:
      "La confiance numérique ne vient pas seulement d'une politique affichée. Elle vient de pratiques simples qui rendent l'entreprise plus fiable dans ses communications, ses formulaires et sa gestion des données.",
    takeaways: [
      "Une entreprise qui connaît ses données répond mieux aux demandes.",
      "Des formulaires sobres et clairs réduisent la friction avec les clients.",
      "L'IA et la cybersécurité gagnent à être expliquées simplement."
    ],
    sections: [
      {
        heading: "Rendre les pratiques visibles",
        body: [
          "Un client n'a pas besoin de voir toute votre architecture technique. Il a besoin de comprendre quelles informations vous demandez, pourquoi vous les demandez et comment il peut poser une question.",
          "Cette clarté est un bénéfice commercial. Elle réduit les hésitations, améliore les formulaires et montre que l'entreprise prend ses responsabilités numériques au sérieux."
        ]
      },
      {
        heading: "Relier confiance et efficacité",
        body: [
          "La confiance n'est pas seulement une promesse externe. Quand les données sont rangées, les accès sont justifiés et les procédures sont connues, l'équipe travaille mieux.",
          "Moins de temps perdu à chercher une information, moins de doublons, moins de décisions improvisées: c'est aussi ça, une bonne hygiène informatique."
        ]
      },
      {
        heading: "Adopter l'IA sans brouiller le message",
        body: [
          "Les clients et partenaires peuvent se poser des questions sur l'utilisation de l'IA. Une charte courte aide à préciser ce qui est permis, ce qui doit être validé et ce qui ne doit pas être exposé.",
          "L'entreprise peut alors profiter des gains de productivité sans donner l'impression d'improviser avec les données."
        ]
      }
    ],
    faq: [
      {
        question: "La confiance client est-elle un objectif SEO?",
        answer:
          "Oui, indirectement. Un contenu clair, utile et cohérent aide les visiteurs, les moteurs de recherche et les assistants IA à comprendre votre expertise."
      },
      {
        question: "Faut-il afficher toutes ses procédures?",
        answer:
          "Non. Il faut surtout rendre visibles les engagements utiles: transparence, contact, demandes de confidentialité et bonnes pratiques générales."
      }
    ],
    primaryCtaHref: "/#diagnostics",
    primaryCtaLabel: "Évaluer ma base numérique",
    secondaryCtaHref: "/contact?source=seo-confiance-client",
    secondaryCtaLabel: "Parler à ForméducWeb",
    relatedPaths: ["/loi-25/formulaires-web", "/intelligence-artificielle/donnees-sensibles-outils-ia", "/cybersecurite/courriels-frauduleux"]
  },
  {
    theme: "loi25",
    slug: "resume-loi-25",
    path: "/loi-25/resume-loi-25",
    eyebrow: "Loi 25",
    title: "Résumé Loi 25 pour PME: comprendre l'essentiel et agir",
    shortTitle: "Résumé Loi 25",
    description:
      "Résumé clair de la Loi 25 pour PME au Québec: données personnelles, transparence, accès, incidents et premières actions.",
    primaryKeyword: "loi 25 résumé",
    updatedAt: defaultUpdatedAt,
    readingTime: "6 min",
    summary:
      "La Loi 25 demande aux organisations de mieux encadrer les renseignements personnels. Pour une PME, le bon réflexe est de transformer l'obligation en démarche de clarté: quelles données sont collectées, pourquoi, où elles vivent et comment elles sont protégées.",
    takeaways: [
      "La Loi 25 touche la collecte, l'utilisation, la conservation et la communication des renseignements personnels.",
      "Le premier gain concret est de faire l'inventaire des données et des formulaires.",
      "Une auto-évaluation aide à prioriser sans transformer le sujet en chantier énorme."
    ],
    sections: [
      {
        heading: "Ce que la Loi 25 change pour une PME",
        body: [
          "La Loi 25 renforce les attentes envers les organisations qui collectent ou utilisent des renseignements personnels. Elle pousse les entreprises à être plus transparentes, à mieux documenter leurs pratiques et à répondre plus clairement aux demandes des personnes.",
          "Pour une PME, l'objectif pratique n'est pas de tout refaire d'un coup. Il faut d'abord repérer les points où les données entrent dans l'entreprise: formulaires, courriels, inscriptions, dossiers clients, outils de paiement, infolettres et plateformes internes."
        ]
      },
      {
        heading: "Pourquoi l'aborder positivement",
        body: [
          "La Loi 25 peut devenir une occasion de faire le ménage dans les données. Une entreprise qui sait ce qu'elle collecte explique mieux ses pratiques, réduit les données inutiles et diminue le risque d'erreur.",
          "Cette démarche améliore aussi l'expérience client. Des formulaires plus sobres, des textes plus clairs et des demandes mieux gérées inspirent confiance."
        ],
        bullets: [
          "Clarifier les formulaires et les finalités.",
          "Limiter les données qui ne servent plus.",
          "Préparer une réponse simple aux demandes de confidentialité."
        ]
      },
      {
        heading: "Les premières actions à prioriser",
        body: [
          "Commencez par un diagnostic. Ensuite, choisissez quelques actions réalistes: mettre à jour les pages légales, revoir les formulaires, identifier les accès et documenter une procédure d'incident.",
          "Le plan doit rester proportionné à votre taille, vos outils et votre capacité d'exécution."
        ]
      }
    ],
    faq: [
      {
        question: "La Loi 25 s'applique-t-elle aux PME?",
        answer:
          "Oui, dès qu'une PME collecte, utilise ou conserve des renseignements personnels dans le cadre de ses activités."
      },
      {
        question: "Quel est le meilleur point de départ?",
        answer:
          "Faire l'inventaire des données, des formulaires et des outils où les renseignements personnels circulent."
      }
    ],
    primaryCtaHref: "/loi-25/wizard",
    primaryCtaLabel: "Faire mon diagnostic Loi 25",
    secondaryCtaHref: "/contact?source=seo-resume-loi25",
    secondaryCtaLabel: "Parler de la Loi 25",
    relatedPaths: ["/loi-25/inventaire-donnees", "/loi-25/formulaires-web", "/loi-25/conservation-suppression-donnees"]
  },
  {
    theme: "loi25",
    slug: "inventaire-donnees",
    path: "/loi-25/inventaire-donnees",
    eyebrow: "Données",
    title: "Inventaire des données personnelles PME: la base pour la Loi 25",
    shortTitle: "Inventaire des données",
    description:
      "Comment faire un inventaire simple des données personnelles dans une PME: formulaires, outils, accès, conservation et priorités Loi 25.",
    primaryKeyword: "inventaire données personnelles PME",
    updatedAt: defaultUpdatedAt,
    readingTime: "6 min",
    summary:
      "L'inventaire des données est le point de départ le plus concret. Il permet de savoir quelles informations personnelles entrent dans l'entreprise, où elles sont conservées et qui peut les consulter.",
    takeaways: [
      "L'inventaire rend les obligations Loi 25 plus faciles à comprendre.",
      "Il révèle souvent des doublons, vieux outils ou accès inutiles.",
      "Il prépare le terrain pour la cybersécurité et l'IA."
    ],
    sections: [
      {
        heading: "Lister les points d'entrée",
        body: [
          "Commencez par les endroits où une personne vous transmet de l'information: formulaire de contact, inscription, paiement, candidature, courriel, téléphone ou document partagé.",
          "Chaque point d'entrée doit répondre à trois questions: quelles données sont demandées, pourquoi elles sont demandées et dans quel outil elles se retrouvent ensuite."
        ]
      },
      {
        heading: "Relier données et accès",
        body: [
          "Un inventaire utile ne s'arrête pas au nom de l'outil. Il indique aussi les personnes qui peuvent voir, exporter ou modifier les données.",
          "Cette étape est positive pour l'équipe: elle clarifie les responsabilités et réduit les accès trop larges."
        ],
        bullets: [
          "Identifier les comptes administrateurs.",
          "Repérer les accès partagés.",
          "Fermer les accès qui ne sont plus nécessaires."
        ]
      },
      {
        heading: "Transformer l'inventaire en actions",
        body: [
          "Une fois l'inventaire fait, choisissez les corrections à plus fort impact: retirer un champ inutile, ajuster une mention de formulaire, revoir la conservation ou sécuriser un outil qui contient beaucoup de données."
        ]
      }
    ],
    faq: [
      {
        question: "L'inventaire doit-il être compliqué?",
        answer:
          "Non. Un tableau simple suffit souvent pour démarrer: donnée, source, outil, accès, durée de conservation et action à poser."
      },
      {
        question: "Qui devrait faire l'inventaire?",
        answer:
          "La direction, l'administration, le marketing et la personne responsable des outils numériques devraient contribuer."
      }
    ],
    primaryCtaHref: "/loi-25/wizard",
    primaryCtaLabel: "Évaluer mes pratiques Loi 25",
    secondaryCtaHref: "/contact?source=seo-inventaire-donnees",
    secondaryCtaLabel: "Demander de l'aide",
    relatedPaths: ["/loi-25/resume-loi-25", "/loi-25/formulaires-web", "/cybersecurite/acces-employes"]
  },
  {
    theme: "loi25",
    slug: "formulaires-web",
    path: "/loi-25/formulaires-web",
    eyebrow: "Formulaires",
    title: "Formulaires web et Loi 25: demander moins, expliquer mieux",
    shortTitle: "Formulaires web",
    description:
      "Bonnes pratiques pour des formulaires web plus sobres, clairs et alignés avec la Loi 25 pour PME au Québec.",
    primaryKeyword: "formulaire web Loi 25",
    updatedAt: defaultUpdatedAt,
    readingTime: "5 min",
    summary:
      "Les formulaires sont souvent le premier contact entre une PME et les renseignements personnels. Les rendre plus sobres et plus clairs améliore à la fois la conformité, la confiance et la conversion.",
    takeaways: [
      "Chaque champ devrait avoir une utilité claire.",
      "La personne doit comprendre pourquoi l'information est demandée.",
      "Un formulaire bien conçu réduit les données inutiles à gérer."
    ],
    sections: [
      {
        heading: "Revoir chaque champ",
        body: [
          "Un bon formulaire demande seulement ce qui est nécessaire pour répondre au besoin. Plus un formulaire collecte de données, plus l'entreprise doit les gérer, les protéger et les expliquer.",
          "La sobriété est donc un avantage: elle simplifie le parcours client et réduit la surface de risque."
        ]
      },
      {
        heading: "Ajouter du contexte au bon endroit",
        body: [
          "Les mentions de confidentialité doivent être faciles à trouver et écrites en langage clair. Une courte phrase près du bouton d'envoi peut rassurer sans alourdir l'interface.",
          "Le lien vers la politique de confidentialité doit être visible, mais il ne doit pas remplacer une explication simple dans le formulaire lui-même."
        ]
      },
      {
        heading: "Vérifier la suite du parcours",
        body: [
          "Le formulaire n'est que le début. Il faut aussi savoir où vont les soumissions, qui reçoit les courriels, combien de temps les messages restent dans l'outil et qui peut exporter les données."
        ],
        bullets: [
          "Tester la destination des soumissions.",
          "Limiter les notifications aux personnes utiles.",
          "Supprimer les anciens formulaires inutilisés."
        ]
      }
    ],
    faq: [
      {
        question: "Faut-il une case de consentement partout?",
        answer:
          "Pas nécessairement. Le bon mécanisme dépend du contexte, de la finalité et du type d'information demandée."
      },
      {
        question: "Un formulaire plus court aide-t-il le SEO?",
        answer:
          "Indirectement, oui. Il améliore l'expérience utilisateur et soutient une promesse de confiance plus crédible."
      }
    ],
    primaryCtaHref: "/loi-25/wizard",
    primaryCtaLabel: "Vérifier mes formulaires",
    secondaryCtaHref: "/contact?source=seo-formulaires-loi25",
    secondaryCtaLabel: "Parler de mes formulaires",
    relatedPaths: ["/loi-25/inventaire-donnees", "/hygiene-informatique/confiance-client", "/services/site-web"]
  },
  {
    theme: "loi25",
    slug: "conservation-suppression-donnees",
    path: "/loi-25/conservation-suppression-donnees",
    eyebrow: "Conservation",
    title: "Conservation des données personnelles: supprimer sans perdre le contrôle",
    shortTitle: "Conservation des données",
    description:
      "Comment une PME peut aborder la conservation et la suppression des données personnelles avec une approche simple et positive.",
    primaryKeyword: "conservation données personnelles",
    updatedAt: defaultUpdatedAt,
    readingTime: "5 min",
    summary:
      "Conserver moins de données inutiles réduit le risque, facilite les recherches internes et clarifie les responsabilités. Le ménage numérique est un geste d'efficacité autant que de conformité.",
    takeaways: [
      "Les données inutiles coûtent de l'attention et augmentent le risque.",
      "Une règle de conservation doit être compréhensible par l'équipe.",
      "La suppression doit être prudente, documentée et réaliste."
    ],
    sections: [
      {
        heading: "Identifier ce qui doit rester",
        body: [
          "Avant de supprimer, il faut comprendre pourquoi une donnée est conservée: service au client, obligation administrative, suivi de projet, comptabilité ou autre besoin réel.",
          "Cette discussion aide l'entreprise à séparer les informations utiles des archives accumulées par habitude."
        ]
      },
      {
        heading: "Créer des règles simples",
        body: [
          "Une règle de conservation n'a pas besoin d'être parfaite pour être utile. Elle doit surtout être claire: quoi garder, où, pendant combien de temps, qui décide et comment documenter les exceptions.",
          "Le but est d'éviter que chaque employé invente sa propre façon de gérer les données."
        ]
      },
      {
        heading: "Nettoyer par priorité",
        body: [
          "Commencez par les endroits les plus sensibles ou les plus faciles à corriger: formulaires, fichiers partagés, exports CSV, anciennes listes de contacts et comptes d'anciens employés."
        ]
      }
    ],
    faq: [
      {
        question: "Doit-on supprimer toutes les anciennes données?",
        answer:
          "Non. Certaines données doivent être conservées pour des raisons administratives, contractuelles ou légales. L'important est d'avoir une règle claire."
      },
      {
        question: "Par où commencer le ménage?",
        answer:
          "Commencez par les données personnelles faciles à identifier et les outils où les accès sont les plus larges."
      }
    ],
    primaryCtaHref: "/loi-25/wizard",
    primaryCtaLabel: "Prioriser mon ménage Loi 25",
    secondaryCtaHref: "/contact?source=seo-conservation-donnees",
    secondaryCtaLabel: "Valider mes priorités",
    relatedPaths: ["/loi-25/inventaire-donnees", "/cybersecurite/acces-employes", "/hygiene-informatique/10-gestes"]
  },
  {
    theme: "loi25",
    slug: "acces-renseignements-personnels",
    path: "/loi-25/acces-renseignements-personnels",
    eyebrow: "Demandes",
    title: "Accès aux renseignements personnels: préparer une réponse claire",
    shortTitle: "Accès aux renseignements",
    description:
      "Comment préparer une PME à répondre aux demandes d'accès ou de correction de renseignements personnels avec calme et méthode.",
    primaryKeyword: "accès renseignements personnels Loi 25",
    updatedAt: defaultUpdatedAt,
    readingTime: "5 min",
    summary:
      "Une demande d'accès aux renseignements personnels est plus facile à gérer quand l'entreprise sait où sont les données, qui peut répondre et quelles étapes suivre.",
    takeaways: [
      "La préparation réduit le stress quand une demande arrive.",
      "L'inventaire des données rend la recherche plus rapide.",
      "Une procédure courte aide l'équipe à répondre de façon cohérente."
    ],
    sections: [
      {
        heading: "Savoir qui répond",
        body: [
          "La première difficulté n'est pas toujours technique. C'est souvent de savoir qui prend la demande, qui vérifie l'identité, qui cherche les informations et qui communique la réponse.",
          "Une petite procédure interne évite les transferts flous et les délais inutiles."
        ]
      },
      {
        heading: "Retrouver les données rapidement",
        body: [
          "Si les données sont dispersées entre formulaires, courriels, CRM, fichiers partagés et outils externes, la réponse devient plus compliquée.",
          "L'inventaire des données aide à savoir où chercher et à éviter d'oublier un système important."
        ]
      },
      {
        heading: "Rester simple et respectueux",
        body: [
          "La personne qui fait une demande veut généralement comprendre ce que l'entreprise détient et comment corriger une information. Une réponse claire, sobre et respectueuse renforce la confiance."
        ]
      }
    ],
    faq: [
      {
        question: "Une PME doit-elle prévoir une procédure de demande?",
        answer:
          "Oui, au moins une procédure courte indiquant qui reçoit la demande, où chercher les données et comment documenter la réponse."
      },
      {
        question: "Le site web doit-il faciliter ces demandes?",
        answer:
          "Oui. Une page ou un formulaire de demande de confidentialité peut réduire la friction et orienter la personne vers le bon canal."
      }
    ],
    primaryCtaHref: "/loi-25/wizard",
    primaryCtaLabel: "Tester ma préparation",
    secondaryCtaHref: "/demande-confidentialite",
    secondaryCtaLabel: "Voir le parcours de demande",
    relatedPaths: ["/loi-25/inventaire-donnees", "/loi-25/resume-loi-25", "/politique-confidentialite"]
  },
  {
    theme: "cybersecurity",
    slug: "mfa-pme",
    path: "/cybersecurite/mfa-pme",
    eyebrow: "Accès",
    title: "Authentification multifacteur MFA pour PME: protéger les comptes importants",
    shortTitle: "MFA pour PME",
    description:
      "Pourquoi activer l'authentification multifacteur MFA sur les comptes importants améliore rapidement la cybersécurité d'une PME.",
    primaryKeyword: "authentification multifacteur PME",
    updatedAt: defaultUpdatedAt,
    readingTime: "5 min",
    summary:
      "L'authentification multifacteur est l'une des mesures les plus rentables pour réduire les accès non autorisés. Elle protège les comptes même lorsqu'un mot de passe circule ou se fait voler.",
    takeaways: [
      "La MFA doit couvrir courriel, administration, finances, cloud et outils clients.",
      "L'adoption réussit mieux avec une courte explication d'équipe.",
      "Les comptes administrateurs doivent être traités en priorité."
    ],
    sections: [
      {
        heading: "Pourquoi la MFA change vite le niveau de protection",
        body: [
          "Un mot de passe seul est fragile. Il peut être réutilisé, deviné, partagé ou capturé dans une campagne d'hameçonnage.",
          "La MFA ajoute une étape de vérification qui rend l'accès beaucoup plus difficile pour une personne non autorisée."
        ]
      },
      {
        heading: "Prioriser les comptes critiques",
        body: [
          "Commencez par les comptes qui ouvrent le plus de portes: courriel, Microsoft 365 ou Google Workspace, hébergement, nom de domaine, banque, comptabilité, CRM et outils de paiement.",
          "Les comptes administrateurs doivent avoir une protection plus forte et ne devraient pas être partagés."
        ]
      },
      {
        heading: "Accompagner l'équipe",
        body: [
          "La MFA fonctionne mieux quand l'équipe comprend pourquoi elle existe et comment réagir à une demande inattendue.",
          "Présentez-la comme une protection du travail quotidien, pas comme une contrainte imposée sans contexte."
        ]
      }
    ],
    faq: [
      {
        question: "La MFA est-elle suffisante pour sécuriser une PME?",
        answer:
          "Non, mais c'est une base très forte. Elle doit être combinée aux sauvegardes, mises à jour, accès justifiés et procédures d'incident."
      },
      {
        question: "Quels comptes protéger en premier?",
        answer:
          "Le courriel, les comptes administrateurs, les finances, l'hébergement web et les outils contenant des données clients."
      }
    ],
    primaryCtaHref: "/cybersecurite/wizard",
    primaryCtaLabel: "Évaluer ma posture cyber",
    secondaryCtaHref: "/contact?source=seo-mfa-pme",
    secondaryCtaLabel: "Planifier la MFA",
    relatedPaths: ["/cybersecurite/acces-employes", "/cybersecurite/courriels-frauduleux", "/hygiene-informatique/10-gestes"]
  },
  {
    theme: "cybersecurity",
    slug: "sauvegardes-restauration",
    path: "/cybersecurite/sauvegardes-restauration",
    eyebrow: "Sauvegardes",
    title: "Sauvegarde informatique PME: tester la restauration avant l'urgence",
    shortTitle: "Sauvegardes",
    description:
      "Comment vérifier la sauvegarde informatique d'une PME et tester la restauration pour réduire les risques opérationnels.",
    primaryKeyword: "sauvegarde informatique PME",
    updatedAt: defaultUpdatedAt,
    readingTime: "5 min",
    summary:
      "Une sauvegarde n'est rassurante que si elle peut être restaurée. Tester la restauration transforme une croyance en preuve et donne à l'équipe un vrai filet de sécurité.",
    takeaways: [
      "Il faut savoir ce qui est sauvegardé, où et à quelle fréquence.",
      "Un test de restauration simple vaut mieux qu'une promesse jamais vérifiée.",
      "Les sauvegardes doivent couvrir les données critiques, pas seulement le site web."
    ],
    sections: [
      {
        heading: "Voir ce qui est réellement protégé",
        body: [
          "Beaucoup d'entreprises pensent avoir des sauvegardes, mais ne savent pas précisément quels dossiers, bases de données, courriels ou outils sont couverts.",
          "La première étape consiste à lister les actifs essentiels: documents clients, données comptables, site web, CRM, courriel et fichiers partagés."
        ]
      },
      {
        heading: "Tester la restauration",
        body: [
          "Le test n'a pas besoin d'être complexe. Il peut s'agir de restaurer un fichier, une version de site ou une petite base de données dans un environnement contrôlé.",
          "Ce test révèle souvent des écarts de droits d'accès, de fréquence, de documentation ou de responsabilité."
        ]
      },
      {
        heading: "Documenter le scénario",
        body: [
          "En cas d'incident, l'équipe doit savoir qui appelle qui, où se trouvent les sauvegardes et combien de temps la restauration peut prendre.",
          "Une page de procédure suffit pour commencer."
        ]
      }
    ],
    faq: [
      {
        question: "À quelle fréquence tester une restauration?",
        answer:
          "Pour une PME, un test léger chaque trimestre ou après un changement important est un bon point de départ."
      },
      {
        question: "Le cloud remplace-t-il les sauvegardes?",
        answer:
          "Non. Un outil cloud peut avoir de la redondance, mais cela ne remplace pas toujours une stratégie de sauvegarde et restauration adaptée."
      }
    ],
    primaryCtaHref: "/cybersecurite/wizard",
    primaryCtaLabel: "Vérifier mes sauvegardes",
    secondaryCtaHref: "/contact?source=seo-sauvegardes",
    secondaryCtaLabel: "Préparer un test",
    relatedPaths: ["/cybersecurite/procedure-incident", "/cybersecurite/mises-a-jour", "/hygiene-informatique/score-hygiene-informatique-pme"]
  },
  {
    theme: "cybersecurity",
    slug: "acces-employes",
    path: "/cybersecurite/acces-employes",
    eyebrow: "Accès",
    title: "Gestion des accès employés: sécuriser les comptes et les données PME",
    shortTitle: "Accès employés",
    description:
      "Bonnes pratiques simples pour gérer les accès employés, comptes partagés, départs et droits administrateurs dans une PME.",
    primaryKeyword: "gestion des accès employés",
    updatedAt: defaultUpdatedAt,
    readingTime: "5 min",
    summary:
      "La gestion des accès est un geste d'hygiène informatique central. Elle protège les données, clarifie les responsabilités et évite que d'anciens comptes restent ouverts trop longtemps.",
    takeaways: [
      "Chaque accès devrait être lié à une personne et un besoin.",
      "Les départs d'employés doivent déclencher une fermeture d'accès.",
      "Les comptes partagés créent de la confusion et compliquent les enquêtes."
    ],
    sections: [
      {
        heading: "Faire l'inventaire des accès",
        body: [
          "Listez les principaux outils et les personnes qui y ont accès. Portez une attention particulière aux comptes administrateurs, aux exports de données et aux dossiers partagés.",
          "Cet inventaire peut être simple, mais il doit être assez clair pour prendre des décisions."
        ]
      },
      {
        heading: "Réduire les accès trop larges",
        body: [
          "Un accès doit correspondre au rôle actuel de la personne. Quand un rôle change, les droits doivent changer aussi.",
          "Cette pratique protège l'entreprise et aide les employés à travailler dans un cadre plus net."
        ]
      },
      {
        heading: "Prévoir arrivées et départs",
        body: [
          "Une checklist d'arrivée et de départ évite les oublis. Elle devrait couvrir courriel, outils internes, fichiers partagés, appareils, gestionnaire de mots de passe et plateformes externes."
        ]
      }
    ],
    faq: [
      {
        question: "Les comptes partagés sont-ils un problème?",
        answer:
          "Oui. Ils rendent difficile de savoir qui a fait quoi et compliquent la fermeture d'accès quand une personne quitte."
      },
      {
        question: "Faut-il revoir les accès souvent?",
        answer:
          "Une revue trimestrielle légère est un bon départ pour une PME, surtout pour les comptes administrateurs."
      }
    ],
    primaryCtaHref: "/cybersecurite/wizard",
    primaryCtaLabel: "Diagnostiquer mes accès",
    secondaryCtaHref: "/contact?source=seo-acces-employes",
    secondaryCtaLabel: "Revoir les accès",
    relatedPaths: ["/loi-25/inventaire-donnees", "/cybersecurite/mfa-pme", "/loi-25/conservation-suppression-donnees"]
  },
  {
    theme: "cybersecurity",
    slug: "courriels-frauduleux",
    path: "/cybersecurite/courriels-frauduleux",
    eyebrow: "Courriel",
    title: "Hameçonnage et courriels frauduleux: créer un réflexe d'équipe",
    shortTitle: "Courriels frauduleux",
    description:
      "Comment aider une PME à reconnaître, signaler et gérer l'hameçonnage et les courriels frauduleux avec une procédure simple.",
    primaryKeyword: "hameçonnage PME",
    updatedAt: defaultUpdatedAt,
    readingTime: "5 min",
    summary:
      "Les courriels frauduleux exploitent souvent l'urgence, la routine ou la confiance. Une bonne hygiène d'équipe réduit les clics risqués et accélère la réaction.",
    takeaways: [
      "Le but n'est pas de blâmer, mais de signaler vite.",
      "Une procédure claire réduit les hésitations.",
      "La MFA limite les conséquences si un mot de passe est compromis."
    ],
    sections: [
      {
        heading: "Reconnaître les signaux utiles",
        body: [
          "Un courriel suspect peut demander un paiement urgent, un changement de coordonnées bancaires, un mot de passe, une ouverture de pièce jointe ou une connexion à un faux portail.",
          "La formation doit rester concrète et liée aux scénarios que l'équipe voit vraiment."
        ]
      },
      {
        heading: "Encourager le signalement",
        body: [
          "Un employé qui hésite doit savoir à qui transférer le message. Le réflexe de signaler rapidement est plus important que la certitude absolue.",
          "Une culture positive réduit la honte et augmente les chances de réagir avant qu'un incident s'aggrave."
        ]
      },
      {
        heading: "Préparer la réaction",
        body: [
          "Si une personne clique ou fournit une information, l'équipe doit savoir quoi faire: changer le mot de passe, révoquer les sessions, prévenir le responsable et vérifier les accès récents."
        ]
      }
    ],
    faq: [
      {
        question: "Faut-il former toute l'équipe?",
        answer:
          "Oui, surtout les personnes qui gèrent paiements, clients, fournisseurs, courriel partagé ou accès administratifs."
      },
      {
        question: "Que faire après un clic suspect?",
        answer:
          "Signaler rapidement, changer le mot de passe si nécessaire, vérifier les connexions et documenter l'événement."
      }
    ],
    primaryCtaHref: "/cybersecurite/wizard",
    primaryCtaLabel: "Évaluer mes réflexes cyber",
    secondaryCtaHref: "/contact?source=seo-courriels-frauduleux",
    secondaryCtaLabel: "Préparer une procédure",
    relatedPaths: ["/cybersecurite/procedure-incident", "/cybersecurite/mfa-pme", "/hygiene-informatique/confiance-client"]
  },
  {
    theme: "cybersecurity",
    slug: "mises-a-jour",
    path: "/cybersecurite/mises-a-jour",
    eyebrow: "Maintenance",
    title: "Mises à jour de sécurité: une routine simple pour PME",
    shortTitle: "Mises à jour",
    description:
      "Comment organiser les mises à jour de sécurité des appareils, sites web et outils d'une PME sans créer de surcharge.",
    primaryKeyword: "mises à jour sécurité PME",
    updatedAt: defaultUpdatedAt,
    readingTime: "5 min",
    summary:
      "Les mises à jour sont un geste d'entretien numérique. Elles réduisent les vulnérabilités connues et gardent les outils plus fiables.",
    takeaways: [
      "Les appareils, navigateurs, extensions, CMS et plugins doivent être suivis.",
      "Un calendrier simple évite les retards invisibles.",
      "Les sauvegardes doivent être vérifiées avant les mises à jour sensibles."
    ],
    sections: [
      {
        heading: "Savoir quoi maintenir",
        body: [
          "La routine doit couvrir les postes de travail, téléphones professionnels, navigateurs, antivirus, outils cloud, site web, extensions et comptes administrateurs.",
          "Sans inventaire, certaines mises à jour restent oubliées pendant des mois."
        ]
      },
      {
        heading: "Planifier sans bloquer",
        body: [
          "Une PME n'a pas besoin d'une grande procédure pour commencer. Un créneau mensuel, une personne responsable et une courte liste d'outils suffisent souvent.",
          "L'important est de savoir quelles mises à jour sont automatiques et lesquelles doivent être vérifiées manuellement."
        ]
      },
      {
        heading: "Relier mises à jour et sauvegardes",
        body: [
          "Avant une mise à jour importante de site ou de système, il faut confirmer qu'une sauvegarde récente existe et qu'une restauration est possible.",
          "Cette discipline transforme la maintenance en routine rassurante."
        ]
      }
    ],
    faq: [
      {
        question: "Les mises à jour automatiques suffisent-elles?",
        answer:
          "Elles aident beaucoup, mais certains outils, plugins ou appareils exigent encore une vérification manuelle."
      },
      {
        question: "Pourquoi relier mises à jour et sauvegardes?",
        answer:
          "Parce qu'une mise à jour peut causer un problème. Une sauvegarde vérifiée permet de revenir en arrière."
      }
    ],
    primaryCtaHref: "/cybersecurite/wizard",
    primaryCtaLabel: "Vérifier ma routine",
    secondaryCtaHref: "/contact?source=seo-mises-a-jour",
    secondaryCtaLabel: "Structurer la maintenance",
    relatedPaths: ["/cybersecurite/sauvegardes-restauration", "/services/site-web", "/hygiene-informatique/10-gestes"]
  },
  {
    theme: "cybersecurity",
    slug: "procedure-incident",
    path: "/cybersecurite/procedure-incident",
    eyebrow: "Incident",
    title: "Incident de cybersécurité PME: une procédure pour réagir plus vite",
    shortTitle: "Procédure incident",
    description:
      "Créer une procédure d'incident de cybersécurité simple pour PME: signalement, responsabilités, premières actions et communication.",
    primaryKeyword: "incident cybersécurité PME",
    updatedAt: defaultUpdatedAt,
    readingTime: "5 min",
    summary:
      "Une procédure d'incident n'empêche pas tous les problèmes, mais elle évite de perdre les premières minutes. Elle donne à l'équipe un chemin clair quand quelque chose semble anormal.",
    takeaways: [
      "La procédure doit être courte, accessible et testée.",
      "Elle doit nommer les personnes à prévenir et les premières actions.",
      "Elle relie cybersécurité, confidentialité et continuité des opérations."
    ],
    sections: [
      {
        heading: "Définir quand signaler",
        body: [
          "Un incident peut être un compte compromis, un courriel frauduleux, une perte d'appareil, une fuite de données, un paiement suspect ou un comportement anormal d'un système.",
          "La procédure doit dire clairement: en cas de doute, on signale."
        ]
      },
      {
        heading: "Nommer les premières actions",
        body: [
          "Les premières actions dépendent du contexte, mais la procédure peut déjà prévoir qui contacter, comment isoler un appareil, comment changer un mot de passe et où documenter les faits.",
          "Cette clarté réduit le stress et facilite la coordination avec un fournisseur TI au besoin."
        ]
      },
      {
        heading: "Faire un mini-test",
        body: [
          "Un exercice de 20 minutes peut suffire: simuler un courriel frauduleux, une perte d'ordinateur ou un accès suspect et vérifier si l'équipe sait quoi faire."
        ]
      }
    ],
    faq: [
      {
        question: "Une procédure d'incident doit-elle être longue?",
        answer:
          "Non. Une page claire avec les contacts, les étapes et les preuves à conserver est souvent un meilleur départ."
      },
      {
        question: "Faut-il lier incident cyber et Loi 25?",
        answer:
          "Oui, parce qu'un incident cyber peut impliquer des renseignements personnels et demander une gestion de confidentialité."
      }
    ],
    primaryCtaHref: "/cybersecurite/wizard",
    primaryCtaLabel: "Tester ma préparation",
    secondaryCtaHref: "/contact?source=seo-procedure-incident",
    secondaryCtaLabel: "Créer ma procédure",
    relatedPaths: ["/cybersecurite/courriels-frauduleux", "/cybersecurite/sauvegardes-restauration", "/loi-25/acces-renseignements-personnels"]
  },
  {
    theme: "ai",
    slug: "charte-ia-pme",
    path: "/intelligence-artificielle/charte-ia-pme",
    eyebrow: "Gouvernance IA",
    title: "Charte IA pour PME: encadrer l'intelligence artificielle en entreprise",
    shortTitle: "Charte IA PME",
    description:
      "Créer une charte IA courte pour PME: usages permis, données sensibles, validation humaine et règles d'équipe.",
    primaryKeyword: "charte IA entreprise",
    updatedAt: defaultUpdatedAt,
    readingTime: "6 min",
    summary:
      "Une charte IA aide une PME à profiter des outils d'IA sans improviser. Elle clarifie les usages encouragés, les données à protéger et les validations nécessaires.",
    takeaways: [
      "La charte IA doit être courte et utilisable par l'équipe.",
      "Elle doit dire quoi ne jamais entrer dans un outil IA public.",
      "Elle doit encourager les bons cas d'usage, pas seulement interdire."
    ],
    sections: [
      {
        heading: "Encadrer sans bloquer",
        body: [
          "Les employés utilisent déjà l'IA ou vont bientôt l'essayer. Une charte courte transforme cette réalité en pratique plus sûre.",
          "Le ton doit rester positif: l'IA peut aider à rédiger, résumer, structurer, comparer et préparer des idées, mais certains usages demandent plus de prudence."
        ]
      },
      {
        heading: "Définir les données interdites",
        body: [
          "La charte devrait nommer clairement les informations à ne pas coller dans un outil IA sans autorisation: renseignements personnels, dossiers clients, données financières, secrets commerciaux, accès, mots de passe et documents confidentiels.",
          "Cette règle simple protège l'entreprise tout en laissant de la place aux usages utiles."
        ]
      },
      {
        heading: "Prévoir la validation humaine",
        body: [
          "Les résultats IA doivent être relus, adaptés et validés. La charte doit préciser que l'humain reste responsable de la qualité, du ton, des faits et de la décision finale."
        ]
      }
    ],
    faq: [
      {
        question: "Une PME a-t-elle vraiment besoin d'une charte IA?",
        answer:
          "Oui, même courte. Elle évite les usages risqués et rend les bons usages plus faciles à partager."
      },
      {
        question: "La charte doit-elle être juridique?",
        answer:
          "Non. Elle doit surtout être claire, pratique et compréhensible par les équipes."
      }
    ],
    primaryCtaHref: "/intelligence-artificielle/wizard",
    primaryCtaLabel: "Évaluer mes pratiques IA",
    secondaryCtaHref: "/contact?source=seo-charte-ia",
    secondaryCtaLabel: "Créer une charte IA",
    relatedPaths: ["/intelligence-artificielle/donnees-sensibles-outils-ia", "/intelligence-artificielle/validation-humaine", "/hygiene-informatique/10-gestes"]
  },
  {
    theme: "ai",
    slug: "donnees-sensibles-outils-ia",
    path: "/intelligence-artificielle/donnees-sensibles-outils-ia",
    eyebrow: "Données IA",
    title: "Données confidentielles et IA: quoi éviter dans les outils d'intelligence artificielle",
    shortTitle: "Données sensibles IA",
    description:
      "Bonnes pratiques pour éviter d'exposer des données confidentielles ou sensibles dans les outils d'intelligence artificielle.",
    primaryKeyword: "données confidentielles IA",
    updatedAt: defaultUpdatedAt,
    readingTime: "5 min",
    summary:
      "L'IA devient plus utile quand l'équipe sait quelles données ne doivent pas être exposées. Cette règle protège les clients, les employés, la propriété intellectuelle et la réputation de l'entreprise.",
    takeaways: [
      "Ne pas coller de renseignements personnels ou documents confidentiels sans cadre clair.",
      "Anonymiser ou résumer quand c'est possible.",
      "Valider les paramètres et politiques des outils utilisés."
    ],
    sections: [
      {
        heading: "Reconnaître les données sensibles",
        body: [
          "Les données sensibles ne sont pas seulement les numéros ou mots de passe. Elles peuvent inclure des noms de clients, courriels, contrats, soumissions, dossiers internes, stratégies, code source ou informations RH.",
          "La règle d'équipe doit être assez concrète pour que chacun puisse décider rapidement."
        ]
      },
      {
        heading: "Adapter la demande à l'IA",
        body: [
          "Souvent, on peut obtenir une bonne réponse sans exposer le document original. Il suffit de décrire le contexte, retirer les noms, anonymiser les exemples ou demander une structure générique.",
          "Cette habitude garde l'IA utile sans ouvrir inutilement les données."
        ]
      },
      {
        heading: "Choisir les outils avec prudence",
        body: [
          "Tous les outils IA ne gèrent pas les données de la même manière. Il faut comprendre les paramètres de confidentialité, l'utilisation des données pour l'entraînement et les options d'administration."
        ]
      }
    ],
    faq: [
      {
        question: "Peut-on utiliser l'IA avec des données clients?",
        answer:
          "Seulement avec un cadre clair, un outil approprié et une compréhension des risques. Par défaut, il vaut mieux éviter d'exposer les données identifiables."
      },
      {
        question: "L'anonymisation suffit-elle toujours?",
        answer:
          "Non. Elle aide, mais certains contextes peuvent permettre de réidentifier une personne ou révéler une information confidentielle."
      }
    ],
    primaryCtaHref: "/intelligence-artificielle/wizard",
    primaryCtaLabel: "Diagnostiquer mes usages IA",
    secondaryCtaHref: "/contact?source=seo-donnees-ia",
    secondaryCtaLabel: "Encadrer les données IA",
    relatedPaths: ["/intelligence-artificielle/charte-ia-pme", "/loi-25/inventaire-donnees", "/hygiene-informatique/confiance-client"]
  },
  {
    theme: "ai",
    slug: "validation-humaine",
    path: "/intelligence-artificielle/validation-humaine",
    eyebrow: "Qualité",
    title: "Validation humaine de l'IA en entreprise: qualité, contexte et responsabilité",
    shortTitle: "Validation humaine",
    description:
      "Pourquoi la validation humaine est essentielle dans les usages IA en entreprise: faits, ton, décisions et responsabilité.",
    primaryKeyword: "validation humaine IA",
    updatedAt: defaultUpdatedAt,
    readingTime: "5 min",
    summary:
      "L'IA peut accélérer le travail, mais elle ne remplace pas le jugement. La validation humaine garde le contexte, la qualité et la responsabilité dans les mains de l'entreprise.",
    takeaways: [
      "Chaque résultat important doit être relu avant diffusion.",
      "Les faits, chiffres, noms et sources doivent être vérifiés.",
      "L'IA devrait soutenir les décisions, pas les prendre seule."
    ],
    sections: [
      {
        heading: "Relire pour protéger la qualité",
        body: [
          "Un texte généré peut être fluide tout en étant imprécis. Il peut manquer de contexte, inventer une nuance ou utiliser un ton qui ne correspond pas à l'entreprise.",
          "La relecture humaine transforme une sortie brute en contenu utilisable."
        ]
      },
      {
        heading: "Vérifier les faits",
        body: [
          "Les résultats qui touchent à la conformité, la cybersécurité, les prix, les politiques, les contrats ou les données clients doivent être vérifiés avec des sources fiables.",
          "C'est particulièrement important si le contenu sera publié ou envoyé à un client."
        ]
      },
      {
        heading: "Définir les usages à risque",
        body: [
          "La charte IA devrait préciser quels usages exigent une validation supplémentaire: conseils sensibles, décisions RH, recommandations financières, documents juridiques, contenus techniques ou communication externe."
        ]
      }
    ],
    faq: [
      {
        question: "La validation humaine ralentit-elle l'IA?",
        answer:
          "Elle ajoute une étape, mais elle évite les erreurs coûteuses et améliore la qualité finale."
      },
      {
        question: "Qui doit valider?",
        answer:
          "La personne responsable du contenu, du client ou du processus concerné. L'IA ne devrait pas retirer cette responsabilité."
      }
    ],
    primaryCtaHref: "/intelligence-artificielle/wizard",
    primaryCtaLabel: "Évaluer mes garde-fous IA",
    secondaryCtaHref: "/contact?source=seo-validation-ia",
    secondaryCtaLabel: "Former mon équipe",
    relatedPaths: ["/intelligence-artificielle/charte-ia-pme", "/intelligence-artificielle/cas-usage-productifs", "/hygiene-informatique/score-hygiene-informatique-pme"]
  },
  {
    theme: "ai",
    slug: "choix-outils-ia",
    path: "/intelligence-artificielle/choix-outils-ia",
    eyebrow: "Outils IA",
    title: "Outils IA pour PME: choisir selon les besoins, les données et les risques",
    shortTitle: "Choix des outils IA",
    description:
      "Comment choisir des outils IA pour PME en partant des besoins, des données, des risques et de l'adoption réelle.",
    primaryKeyword: "outils IA PME",
    updatedAt: defaultUpdatedAt,
    readingTime: "5 min",
    summary:
      "Le bon outil IA est celui qui sert un cas d'usage réel, respecte les données et peut être adopté par l'équipe. Le choix vient après la clarification des besoins.",
    takeaways: [
      "Un outil doit répondre à un problème concret.",
      "Les paramètres de données et d'administration comptent autant que les fonctionnalités.",
      "Un petit pilote mesuré vaut mieux qu'un déploiement flou."
    ],
    sections: [
      {
        heading: "Partir des cas d'usage",
        body: [
          "Avant de comparer les outils, listez les tâches où l'IA peut aider: résumer, rédiger, classer, préparer, analyser, répondre ou documenter.",
          "Chaque cas d'usage doit avoir un responsable, un bénéfice attendu et une règle de validation."
        ]
      },
      {
        heading: "Évaluer les données",
        body: [
          "Un outil qui manipule des informations sensibles doit être évalué plus sérieusement qu'un outil utilisé pour générer des idées générales.",
          "Les paramètres d'entraînement, de conservation, d'accès et d'administration doivent être compris avant l'adoption."
        ]
      },
      {
        heading: "Lancer un pilote court",
        body: [
          "Un pilote de 30 jours permet de tester l'utilité réelle, les irritants et les règles nécessaires. Il donne aussi une base pour former l'équipe."
        ]
      }
    ],
    faq: [
      {
        question: "Quel est le meilleur outil IA pour une PME?",
        answer:
          "Il n'y a pas de réponse universelle. Le meilleur outil dépend des cas d'usage, des données, du budget et de l'équipe."
      },
      {
        question: "Faut-il acheter un outil avant d'écrire une charte?",
        answer:
          "Non. Une charte courte peut guider le choix des outils et éviter des essais risqués."
      }
    ],
    primaryCtaHref: "/intelligence-artificielle/wizard",
    primaryCtaLabel: "Clarifier mes besoins IA",
    secondaryCtaHref: "/contact?source=seo-choix-outils-ia",
    secondaryCtaLabel: "Choisir un outil IA",
    relatedPaths: ["/intelligence-artificielle/cas-usage-productifs", "/intelligence-artificielle/donnees-sensibles-outils-ia", "/intelligence-artificielle/charte-ia-pme"]
  },
  {
    theme: "ai",
    slug: "cas-usage-productifs",
    path: "/intelligence-artificielle/cas-usage-productifs",
    eyebrow: "Productivité",
    title: "IA en entreprise: cas d'usage productifs pour PME",
    shortTitle: "Cas d'usage IA",
    description:
      "Exemples de cas d'usage IA en entreprise pour PME: rédaction, synthèse, support, documentation et amélioration des processus.",
    primaryKeyword: "IA en entreprise cas d'usage",
    updatedAt: defaultUpdatedAt,
    readingTime: "5 min",
    summary:
      "Les meilleurs cas d'usage IA pour une PME sont souvent simples: gagner du temps, clarifier une information, préparer une première version ou réduire les tâches répétitives.",
    takeaways: [
      "Le gain doit être concret: temps, qualité, cohérence ou rapidité.",
      "Les usages doivent respecter les données sensibles.",
      "Les résultats doivent être validés par une personne responsable."
    ],
    sections: [
      {
        heading: "Chercher les irritants quotidiens",
        body: [
          "L'IA est plus utile quand elle attaque un irritant réel: résumer une réunion, transformer des notes en plan d'action, préparer une réponse, structurer une procédure ou comparer des options.",
          "Ces gains sont faciles à tester et à expliquer."
        ]
      },
      {
        heading: "Mesurer le bénéfice",
        body: [
          "Un bon cas d'usage doit pouvoir être évalué. Est-ce que l'équipe gagne du temps? Est-ce que le résultat est plus clair? Est-ce que la qualité est plus constante?",
          "Sans mesure simple, l'adoption devient une impression."
        ]
      },
      {
        heading: "Partager les bons exemples",
        body: [
          "Quand un usage fonctionne, documentez le prompt, le contexte, les limites et les validations nécessaires. L'équipe apprend plus vite avec des exemples internes."
        ]
      }
    ],
    faq: [
      {
        question: "Quels cas d'usage IA sont les plus sûrs pour commencer?",
        answer:
          "Les usages avec peu de données sensibles: reformulation, structure de document, idées, synthèses anonymisées et procédures internes."
      },
      {
        question: "Comment éviter l'effet gadget?",
        answer:
          "Choisir un problème précis, tester pendant 30 jours et mesurer un bénéfice simple."
      }
    ],
    primaryCtaHref: "/intelligence-artificielle/wizard",
    primaryCtaLabel: "Trouver mes cas d'usage",
    secondaryCtaHref: "/contact?source=seo-cas-usage-ia",
    secondaryCtaLabel: "Faire un atelier IA",
    relatedPaths: ["/intelligence-artificielle/choix-outils-ia", "/intelligence-artificielle/validation-humaine", "/hygiene-informatique/confiance-client"]
  }
];

export const pillarSeoContent: Record<
  AssessmentType,
  {
    eyebrow: string;
    title: string;
    answer: string;
    bullets: string[];
    supportTheme: SeoSupportTheme;
  }
> = {
  loi25: {
    eyebrow: "Réponse rapide",
    title: "La Loi 25 est un bon point de départ pour améliorer l'hygiène informatique.",
    answer:
      "Pour une PME, la Loi 25 ne devrait pas être seulement une obligation. Elle peut servir à mieux connaître les données, rendre les formulaires plus clairs, réduire les accès inutiles et inspirer confiance aux clients.",
    bullets: [
      "Inventorier les données et les outils qui les contiennent.",
      "Clarifier les formulaires, pages légales et demandes de confidentialité.",
      "Relier la confidentialité aux accès, sauvegardes et incidents."
    ],
    supportTheme: "loi25"
  },
  cybersecurity: {
    eyebrow: "Réponse rapide",
    title: "La cybersécurité PME commence par une hygiène informatique réaliste.",
    answer:
      "Avant d'acheter des outils, une PME gagne à vérifier les bases: MFA, sauvegardes, accès employés, courriels suspects, mises à jour et procédure d'incident. Ces gestes réduisent les risques et rendent l'équipe plus confiante.",
    bullets: [
      "Protéger les comptes importants avec la MFA.",
      "Tester les sauvegardes et clarifier les accès.",
      "Préparer une réaction courte en cas d'incident."
    ],
    supportTheme: "cybersecurity"
  },
  ai: {
    eyebrow: "Réponse rapide",
    title: "Une bonne hygiène IA permet d'adopter l'intelligence artificielle avec plus de confiance.",
    answer:
      "L'IA peut aider une PME à gagner du temps, mais elle doit être encadrée: données sensibles, cas d'usage utiles, validation humaine et choix d'outils. Le but est de rendre l'IA productive sans exposer l'entreprise.",
    bullets: [
      "Définir une charte IA courte et compréhensible.",
      "Éviter d'exposer les données sensibles dans les outils IA.",
      "Valider les résultats avant de les utiliser ou publier."
    ],
    supportTheme: "ai"
  }
};

export function getSeoSupportPagesByTheme(theme: SeoSupportTheme) {
  return seoSupportPages.filter((page) => page.theme === theme);
}

export function getSeoSupportPage(theme: SeoSupportTheme, slug: string) {
  return seoSupportPages.find((page) => page.theme === theme && page.slug === slug) ?? null;
}

export function getSeoSupportPageByPath(path: string) {
  return seoSupportPages.find((page) => page.path === path) ?? null;
}

export function getRelatedSeoPages(page: SeoSupportPage) {
  const explicitPages = page.relatedPaths
    .map((path) => getSeoSupportPageByPath(path))
    .filter((relatedPage): relatedPage is SeoSupportPage => Boolean(relatedPage));

  if (explicitPages.length > 0) {
    return explicitPages;
  }

  return seoSupportPages.filter((candidate) => candidate.theme === page.theme && candidate.path !== page.path).slice(0, 3);
}
