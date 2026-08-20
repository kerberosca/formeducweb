export const trainingThemes = [
  { value: "internet", label: "Internet" },
  { value: "ai", label: "Intelligence artificielle" },
  { value: "excel", label: "Excel" },
  { value: "word", label: "Word" },
  { value: "cybersecurity", label: "Cybersécurité" },
  { value: "automation", label: "Automatisation" }
] as const;

export const trainingLevels = [
  { value: "beginner", label: "Débutant" },
  { value: "intermediate", label: "Intermédiaire" },
  { value: "all", label: "Tous niveaux" }
] as const;

export const trainingOffers = [
  { value: "free", label: "Gratuite" },
  { value: "paid", label: "Payante" },
  { value: "custom", label: "Sur mesure" }
] as const;

export type TrainingTheme = (typeof trainingThemes)[number]["value"];
export type TrainingLevel = (typeof trainingLevels)[number]["value"];
export type TrainingOffer = (typeof trainingOffers)[number]["value"];

export type TrainingLessonSection = {
  heading: string;
  paragraphs: readonly string[];
  checklist?: readonly string[];
};

export type TrainingLesson = {
  id: string;
  title: string;
  durationMinutes: number;
  summary: string;
  sections?: readonly TrainingLessonSection[];
  exercise?: string;
};

export type TrainingCourse = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  theme: TrainingTheme;
  level: TrainingLevel;
  offer: TrainingOffer;
  priceLabel: string;
  durationMinutes: number;
  durationLabel: string;
  format: string;
  audience: string;
  outcomes: readonly string[];
  prerequisites: readonly string[];
  lessons: readonly TrainingLesson[];
  availability?: "available" | "preparation";
  isPurchasable?: boolean;
  featured?: boolean;
};

export const courses = [
  {
    slug: "internet-sans-stress",
    title: "Internet sans stress : naviguer, chercher et se protéger",
    shortTitle: "Internet sans stress",
    description:
      "Apprenez les repères essentiels du Web, de la recherche fiable aux formulaires et aux comptes en ligne, dans un parcours sans jargon.",
    theme: "internet",
    level: "beginner",
    offer: "free",
    priceLabel: "Gratuite",
    durationMinutes: 55,
    durationLabel: "Environ 55 min",
    format: "Autonome · 5 courtes leçons",
    audience:
      "Toute personne qui veut utiliser Internet avec plus d’autonomie et de confiance.",
    outcomes: [
      "Reconnaître les éléments de base d’un navigateur Web.",
      "Faire une recherche plus précise et vérifier une source.",
      "Remplir un formulaire et télécharger un fichier avec prudence.",
      "Adopter de meilleurs réflexes pour ses comptes en ligne."
    ],
    prerequisites: [
      "Un ordinateur, une tablette ou un téléphone connecté à Internet.",
      "Aucune connaissance technique préalable."
    ],
    lessons: [
      {
        id: "navigateur",
        title: "Se repérer dans un navigateur",
        durationMinutes: 10,
        summary:
          "Comprendre l’adresse d’un site, les onglets, les liens et les boutons de navigation.",
        sections: [
          {
            heading: "Les quatre repères à connaître",
            paragraphs: [
              "La barre d’adresse indique le site actuellement ouvert. On peut y écrire une adresse complète ou quelques mots pour lancer une recherche.",
              "Les onglets permettent de garder plusieurs pages ouvertes. Le bouton Précédent revient à la page visitée juste avant; un lien ouvre une nouvelle page ou déclenche une action."
            ],
            checklist: [
              "Repérer le nom de domaine dans la barre d’adresse.",
              "Ouvrir un lien dans un nouvel onglet.",
              "Fermer un onglet sans fermer tout le navigateur."
            ]
          },
          {
            heading: "Avant de cliquer",
            paragraphs: [
              "Lisez le texte du lien et observez le contexte. Un gros bouton coloré n’est pas automatiquement l’action la plus importante ni la plus sûre."
            ]
          }
        ],
        exercise:
          "Ouvrez deux sites que vous connaissez dans deux onglets, passez de l’un à l’autre, puis revenez à la page précédente."
      },
      {
        id: "recherche-fiable",
        title: "Chercher et vérifier une information",
        durationMinutes: 12,
        summary:
          "Formuler une bonne recherche, comparer les résultats et reconnaître une source crédible.",
        sections: [
          {
            heading: "Préciser la question",
            paragraphs: [
              "Une recherche utile contient le sujet, le contexte et parfois le lieu ou la date. Par exemple, « aide démarrage entreprise Québec 2026 » est plus précis que « aide entreprise ».",
              "Pour une règle, un programme ou une démarche administrative, commencez par les sites officiels du gouvernement ou de l’organisation concernée."
            ]
          },
          {
            heading: "Vérifier avant d’agir",
            paragraphs: [
              "Regardez qui publie l’information, sa date de mise à jour et si d’autres sources fiables disent la même chose. Une première place dans les résultats n’est pas une garantie de qualité."
            ],
            checklist: [
              "Identifier l’auteur ou l’organisation.",
              "Vérifier la date.",
              "Comparer au moins deux sources pour une décision importante."
            ]
          }
        ],
        exercise:
          "Trouvez les heures d’ouverture d’un service public de votre région et confirmez-les sur le site officiel."
      },
      {
        id: "formulaires-fichiers",
        title: "Formulaires, téléchargements et fichiers",
        durationMinutes: 12,
        summary:
          "Savoir ce qu’on transmet, où va un fichier et quand interrompre une démarche.",
        sections: [
          {
            heading: "Lire avant d’envoyer",
            paragraphs: [
              "Un formulaire devrait expliquer qui recueille les renseignements et pourquoi. Les champs marqués d’un astérisque sont généralement obligatoires.",
              "Avant de joindre un document, confirmez que vous êtes sur le bon site et que le fichier ne contient pas plus d’information que nécessaire."
            ]
          },
          {
            heading: "Retrouver un téléchargement",
            paragraphs: [
              "Les fichiers téléchargés se trouvent habituellement dans le dossier Téléchargements. Ouvrez seulement un fichier que vous attendiez et dont vous reconnaissez la source."
            ],
            checklist: [
              "Vérifier le nom et le type du fichier.",
              "Éviter les fichiers inattendus reçus par message.",
              "Supprimer les copies dont vous n’avez plus besoin."
            ]
          }
        ],
        exercise:
          "Repérez le dossier Téléchargements sur votre appareil et identifiez un ancien fichier que vous pouvez supprimer."
      },
      {
        id: "comptes",
        title: "Protéger ses comptes en ligne",
        durationMinutes: 12,
        summary:
          "Créer des mots de passe distincts et reconnaître une demande de connexion suspecte.",
        sections: [
          {
            heading: "Un mot de passe par service",
            paragraphs: [
              "Réutiliser le même mot de passe permet à un incident sur un site d’ouvrir plusieurs de vos comptes. Un gestionnaire de mots de passe aide à créer et conserver des mots de passe uniques.",
              "L’authentification multifacteur ajoute une seconde vérification. Activez-la d’abord pour votre courriel, vos finances et vos comptes administratifs."
            ]
          },
          {
            heading: "Les signes qui demandent une pause",
            paragraphs: [
              "Une urgence, une menace, une demande inhabituelle de code ou un changement d’adresse Web sont de bons motifs pour arrêter et vérifier autrement."
            ],
            checklist: [
              "Ne jamais transmettre un code de connexion reçu par texto.",
              "Ouvrir le site soi-même plutôt que par un lien inattendu.",
              "Demander de l’aide lorsqu’un message semble inhabituel."
            ]
          }
        ],
        exercise:
          "Choisissez un compte important et vérifiez si l’authentification multifacteur y est activée."
      },
      {
        id: "routine",
        title: "Construire sa routine numérique",
        durationMinutes: 9,
        summary:
          "Réunir les bons réflexes dans une courte routine facile à conserver.",
        sections: [
          {
            heading: "Une routine simple",
            paragraphs: [
              "Gardez vos appareils à jour, rangez régulièrement vos téléchargements et prenez une pause avant toute demande inhabituelle.",
              "L’autonomie numérique ne signifie pas tout savoir. Elle consiste surtout à reconnaître quand avancer, vérifier ou demander de l’aide."
            ],
            checklist: [
              "Mises à jour automatiques activées.",
              "Comptes importants protégés par une seconde vérification.",
              "Sources officielles privilégiées.",
              "Fichiers inutiles supprimés."
            ]
          }
        ],
        exercise:
          "Choisissez deux gestes de la liste et ajoutez-les à votre routine mensuelle."
      }
    ],
    featured: true
  },
  {
    slug: "ia-au-travail",
    title: "Premiers pas avec l’IA au travail",
    shortTitle: "Premiers pas avec l’IA",
    description:
      "Découvrez ce que l’intelligence artificielle peut réellement faire, comment bien lui demander de l’aide et quelles données garder hors des outils publics.",
    theme: "ai",
    level: "beginner",
    offer: "free",
    priceLabel: "Gratuite",
    durationMinutes: 65,
    durationLabel: "Environ 1 h 05",
    format: "Autonome · 5 leçons pratiques",
    audience:
      "Employés, gestionnaires et travailleurs autonomes qui commencent à utiliser des assistants IA.",
    outcomes: [
      "Choisir un cas d’usage simple et pertinent.",
      "Rédiger une demande structurée à un assistant IA.",
      "Éviter de transmettre des données confidentielles.",
      "Valider les faits et garder la responsabilité humaine."
    ],
    prerequisites: [
      "Aucune expérience en intelligence artificielle.",
      "L’accès à un assistant IA est utile, mais non obligatoire."
    ],
    lessons: [
      {
        id: "role-ia",
        title: "Comprendre le rôle d’un assistant IA",
        durationMinutes: 12,
        summary:
          "Distinguer une aide à la rédaction ou à l’analyse d’une source fiable ou d’un décideur.",
        sections: [
          {
            heading: "Un outil de préparation",
            paragraphs: [
              "Un assistant IA peut résumer, reformuler, proposer une structure ou préparer une première version. Il produit une réponse probable à partir de votre demande; il ne comprend pas votre entreprise comme un collègue.",
              "Utilisez-le pour accélérer une tâche que vous êtes en mesure de réviser. Plus l’enjeu est important, plus la validation doit être rigoureuse."
            ]
          },
          {
            heading: "De bons premiers usages",
            paragraphs: [
              "Commencez avec des tâches réversibles : organiser des notes, améliorer la clarté d’un texte, générer des questions ou comparer des options déjà connues."
            ],
            checklist: [
              "Le résultat sera relu par une personne.",
              "La tâche ne contient pas de données sensibles.",
              "Une erreur serait facile à repérer et corriger."
            ]
          }
        ],
        exercise:
          "Choisissez une petite tâche répétitive de votre semaine qui pourrait bénéficier d’une première version assistée."
      },
      {
        id: "bonne-demande",
        title: "Formuler une demande utile",
        durationMinutes: 14,
        summary:
          "Donner le contexte, le résultat attendu, les contraintes et un exemple.",
        sections: [
          {
            heading: "La méthode Contexte–Tâche–Contraintes",
            paragraphs: [
              "Expliquez brièvement votre situation, nommez la tâche précise, puis ajoutez les contraintes : longueur, ton, public, format ou éléments à éviter.",
              "Demandez une première version et améliorez-la par étapes. Une conversation courte est souvent plus efficace qu’une énorme demande parfaite."
            ],
            checklist: [
              "Contexte suffisant, sans information confidentielle.",
              "Résultat attendu clairement nommé.",
              "Format de sortie précisé.",
              "Critères de qualité indiqués."
            ]
          }
        ],
        exercise:
          "Demandez un plan de courriel de suivi en précisant le destinataire, le ton et trois points à couvrir."
      },
      {
        id: "donnees",
        title: "Protéger les données",
        durationMinutes: 13,
        summary:
          "Reconnaître ce qu’il ne faut pas copier dans un outil IA public.",
        sections: [
          {
            heading: "Retirer les renseignements sensibles",
            paragraphs: [
              "Ne copiez pas de renseignements personnels, contrats, dossiers clients, secrets commerciaux, mots de passe ou données financières dans un outil public sans cadre approuvé.",
              "On peut souvent remplacer les noms par des rôles, résumer le contexte ou créer un exemple fictif."
            ]
          },
          {
            heading: "Vérifier l’outil et le compte",
            paragraphs: [
              "Les conditions, réglages de conservation et options d’administration varient d’un service à l’autre. Utilisez les outils autorisés par votre organisation."
            ],
            checklist: [
              "Aucune donnée permettant d’identifier un client ou un employé.",
              "Aucun accès, mot de passe ou secret technique.",
              "Outil et compte approuvés pour ce type de tâche."
            ]
          }
        ],
        exercise:
          "Prenez un exemple de demande et remplacez toutes les informations réelles par un contexte fictif."
      },
      {
        id: "validation",
        title: "Valider le résultat",
        durationMinutes: 14,
        summary:
          "Vérifier les faits, le contexte, le ton et l’action proposée avant utilisation.",
        sections: [
          {
            heading: "Une réponse fluide peut être fausse",
            paragraphs: [
              "L’IA peut inventer une source, mélanger des règles ou omettre une nuance. Vérifiez les noms, chiffres, dates et affirmations importantes avec une source fiable.",
              "La personne qui utilise le résultat reste responsable de ce qui est envoyé, publié ou décidé."
            ],
            checklist: [
              "Les faits importants sont confirmés.",
              "Le ton correspond à l’organisation.",
              "Les limites et incertitudes sont visibles.",
              "Une personne compétente approuve les décisions sensibles."
            ]
          }
        ],
        exercise:
          "Relisez une réponse IA et surlignez séparément les faits à vérifier et les choix de style à adapter."
      },
      {
        id: "mini-processus",
        title: "Créer un mini-processus responsable",
        durationMinutes: 12,
        summary:
          "Documenter un usage simple avec une règle de données et une étape de validation.",
        sections: [
          {
            heading: "Rendre le bon usage répétable",
            paragraphs: [
              "Pour un usage qui fonctionne, notez l’objectif, les données permises, un exemple de demande, la personne qui valide et la façon de mesurer le gain.",
              "Un petit processus clair aide davantage l’équipe qu’une longue liste d’outils."
            ],
            checklist: [
              "Objectif et responsable nommés.",
              "Données permises et interdites précisées.",
              "Validation humaine définie.",
              "Bénéfice mesurable après quelques essais."
            ]
          }
        ],
        exercise:
          "Écrivez une fiche de cinq lignes pour le cas d’usage choisi dans la première leçon."
      }
    ],
    featured: true
  },
  {
    slug: "excel-essentiel",
    title: "Excel essentiel pour la petite entreprise",
    shortTitle: "Excel essentiel",
    description:
      "Structurez des listes fiables, utilisez les formules courantes et créez un suivi simple qui reste compréhensible par toute l’équipe.",
    theme: "excel",
    level: "beginner",
    offer: "paid",
    priceLabel: "49 $ CAD",
    availability: "available",
    isPurchasable: true,
    durationMinutes: 180,
    durationLabel: "Environ 3 h",
    format: "Autonome · exercices téléchargeables",
    audience:
      "Petites équipes qui utilisent Excel pour leurs clients, dépenses, inventaires ou suivis d’activités.",
    outcomes: [
      "Créer une liste facile à filtrer et à mettre à jour.",
      "Utiliser SOMME, SI, NB.SI et RECHERCHEX.",
      "Repérer les erreurs fréquentes dans un classeur partagé.",
      "Présenter un tableau de bord simple."
    ],
    prerequisites: [
      "Une version récente d’Excel sur Windows, Mac ou le Web.",
      "Savoir ouvrir et enregistrer un classeur."
    ],
    lessons: [
      {
        id: "structure",
        title: "Une donnée par cellule, une ligne par élément",
        durationMinutes: 25,
        summary: "Bâtir une base propre avant d’ajouter des formules.",
        sections: [
          {
            heading: "Transformer une liste en données fiables",
            paragraphs: [
              "Une ligne représente un élément complet, par exemple une facture ou un client. Une colonne représente une seule caractéristique : date, montant, statut ou responsable. Cette règle rend les tris, filtres et calculs prévisibles.",
              "Évitez les cellules fusionnées, les lignes vides au milieu d’une liste et les valeurs composées comme « 12 mai — payé ». Séparez la date et le statut afin qu’Excel puisse les traiter selon leur véritable type."
            ],
            checklist: [
              "Un en-tête unique par colonne.",
              "Aucun total manuel au milieu de la liste.",
              "Dates et montants enregistrés comme valeurs, pas comme texte.",
              "Identifiant unique pour chaque élément."
            ]
          },
          {
            heading: "Préparer le fichier de pratique",
            paragraphs: [
              "Ouvrez la feuille Données du classeur fourni. Repérez les colonnes de saisie et les colonnes calculées. La feuille Références contient les choix contrôlés et les hypothèses utilisées par les formules."
            ]
          }
        ],
        exercise:
          "Ajoutez une nouvelle facture à la prochaine ligne du tableau. Donnez-lui un numéro unique, une vraie date et un montant numérique, puis vérifiez qu’elle peut être filtrée sans correction manuelle."
      },
      {
        id: "tableaux",
        title: "Tableaux, filtres et validation des données",
        durationMinutes: 35,
        summary: "Rendre la saisie plus constante et la recherche plus rapide.",
        sections: [
          {
            heading: "Pourquoi utiliser un tableau Excel",
            paragraphs: [
              "Un tableau étend automatiquement les filtres, le style et les formules lorsqu’une nouvelle ligne est ajoutée. Les noms de colonnes restent visibles et les références structurées rendent les calculs plus faciles à relire.",
              "Les filtres répondent à une question précise : quelles factures sont encore envoyées, quel responsable suit les dossiers de formation ou quels montants dépassent un seuil? Commencez par une seule question, puis combinez les critères."
            ]
          },
          {
            heading: "Contrôler la saisie",
            paragraphs: [
              "La validation des données limite les catégories, statuts et responsables à une liste connue. Elle réduit les variantes comme « Payé », « payée » et « paiement reçu », qui seraient comptées séparément.",
              "Conservez les valeurs autorisées dans une feuille Références. On peut ainsi ajouter une catégorie sans modifier chaque cellule."
            ],
            checklist: [
              "Les filtres couvrent toutes les lignes.",
              "Les listes de choix utilisent une source visible.",
              "Une nouvelle ligne reprend les formules du tableau."
            ]
          }
        ],
        exercise:
          "Filtrez les factures Envoyées de plus de 1 000 $, puis ajoutez une catégorie dans la feuille Références et utilisez-la dans une nouvelle ligne."
      },
      {
        id: "formules",
        title: "Les formules qui règlent 80 % des besoins",
        durationMinutes: 40,
        summary: "Calculer, compter et traiter une condition sans complexité.",
        sections: [
          {
            heading: "Construire une formule lisible",
            paragraphs: [
              "Une formule commence par = et combine des références de cellules, des opérateurs et des fonctions. Référencez une hypothèse visible, comme le taux de TPS dans Références!E2, plutôt que d’écrire 5 % dans chaque formule.",
              "SOMME additionne une plage. NB.SI compte les cellules correspondant à un critère. SOMME.SI additionne les montants associés à un statut. SI choisit un résultat selon une condition."
            ]
          },
          {
            heading: "Références relatives et absolues",
            paragraphs: [
              "La référence E2 change lorsque la formule est recopiée vers le bas. La référence $E$2 reste fixe. Dans le fichier de pratique, le montant change à chaque ligne, mais le taux de TPS doit toujours pointer vers la même cellule de la feuille Références."
            ],
            checklist: [
              "Chaque formule peut être expliquée en une phrase.",
              "Les hypothèses sont dans des cellules identifiées.",
              "Les références fixes utilisent les signes $."
            ]
          }
        ],
        exercise:
          "Inspectez les formules TPS, Total et Priorité. Modifiez le taux ou le seuil dans la feuille Références et confirmez que tous les résultats se mettent à jour."
      },
      {
        id: "recherchex",
        title: "Relier deux listes avec RECHERCHEX",
        durationMinutes: 30,
        summary: "Récupérer une information sans copier-coller.",
        sections: [
          {
            heading: "Faire correspondre une clé",
            paragraphs: [
              "RECHERCHEX part d’une valeur unique — numéro de client, code produit ou identifiant — puis renvoie la donnée correspondante dans une autre liste. La clé doit être stable et ne doit pas être un nom susceptible d’être écrit de plusieurs façons.",
              "La structure générale est RECHERCHEX(valeur cherchée; plage de recherche; plage de résultat; valeur si absent). Le quatrième argument permet d’afficher un message clair au lieu de #N/A."
            ]
          },
          {
            heading: "Éviter les copies silencieuses",
            paragraphs: [
              "Un copier-coller fige une ancienne information. Une recherche conserve le lien avec la table de référence. Avant de l’utiliser, vérifiez l’unicité des identifiants et la même nature de données dans les deux listes."
            ]
          }
        ],
        exercise:
          "Créez une petite table Clients avec un identifiant, un nom et une région. Dans une autre zone, utilisez RECHERCHEX pour retourner la région à partir de l’identifiant. Testez aussi un identifiant absent."
      },
      {
        id: "qualite",
        title: "Contrôler les erreurs et protéger les formules",
        durationMinutes: 25,
        summary: "Ajouter des vérifications avant de partager le fichier.",
        sections: [
          {
            heading: "Repérer avant de corriger",
            paragraphs: [
              "Les erreurs courantes sont une formule remplacée par une valeur, une plage qui oublie la dernière ligne, un nombre stocké comme texte ou une référence cassée. Comparez les formules d’une même colonne et contrôlez quelques résultats à la calculatrice.",
              "La mise en forme conditionnelle peut signaler une facture importante non payée, mais elle ne remplace pas la règle métier. Gardez le seuil dans une cellule visible et faites dépendre le signal de cette cellule."
            ],
            checklist: [
              "Aucune erreur #REF!, #N/A ou #DIV/0! non expliquée.",
              "Les totaux se réconcilient avec la liste source.",
              "Les cellules de formule sont protégées avant partage.",
              "Une copie de sauvegarde existe avant une transformation importante."
            ]
          }
        ],
        exercise:
          "Dans une copie du classeur, remplacez volontairement une formule de Total par une valeur. Comparez les formules de la colonne pour retrouver l’anomalie, puis rétablissez-la."
      },
      {
        id: "tableau-bord",
        title: "Créer un tableau de bord lisible",
        durationMinutes: 25,
        summary: "Faire ressortir quelques indicateurs utiles sans surcharger.",
        sections: [
          {
            heading: "Choisir les indicateurs qui aident une décision",
            paragraphs: [
              "Un tableau de bord simple répond à quelques questions : combien a été facturé, combien a été payé, quel montant reste à encaisser et combien de dossiers sont dans chaque statut. Chaque indicateur doit conduire à une action ou à une vérification.",
              "Les valeurs du tableau de bord doivent être des formules reliées aux données. Ajoutez la période et les unités, utilisez des formats cohérents et évitez les graphiques décoratifs qui répètent les mêmes chiffres."
            ]
          },
          {
            heading: "Faire une vérification finale",
            paragraphs: [
              "Réconciliez le total facturé avec la somme de la colonne Total. Filtrez un statut et comparez le nombre de lignes au résultat de NB.SI. Enfin, ajoutez une facture de test et confirmez que les indicateurs changent."
            ],
            checklist: [
              "Titre, période et devise visibles.",
              "Formules liées à la source, sans copie manuelle.",
              "Quatre à six indicateurs au maximum.",
              "Test d’ajout d’une nouvelle ligne réussi."
            ]
          }
        ],
        exercise:
          "Utilisez la feuille Tableau de bord du fichier de pratique. Ajoutez une facture Payée, puis confirmez les quatre indicateurs et le décompte par statut."
      }
    ]
  },
  {
    slug: "word-documents-professionnels",
    title: "Word : créer des documents professionnels et accessibles",
    shortTitle: "Word professionnel",
    description:
      "Utilisez les styles, modèles et outils de révision pour produire plus vite des documents cohérents, faciles à lire et à mettre à jour.",
    theme: "word",
    level: "beginner",
    offer: "paid",
    priceLabel: "39 $ CAD · en préparation",
    availability: "preparation",
    isPurchasable: false,
    durationMinutes: 150,
    durationLabel: "Environ 2 h 30",
    format: "Autonome · modèles inclus",
    audience:
      "Toute personne qui prépare régulièrement des procédures, offres de service, rapports ou documents clients.",
    outcomes: [
      "Structurer un document avec les styles de titre.",
      "Créer une mise en page cohérente et réutilisable.",
      "Collaborer avec les commentaires et le suivi des modifications.",
      "Vérifier l’accessibilité avant de produire un PDF."
    ],
    prerequisites: [
      "Une version récente de Microsoft Word.",
      "Savoir ouvrir, modifier et enregistrer un document."
    ],
    lessons: [
      {
        id: "styles",
        title: "Styles et structure du document",
        durationMinutes: 30,
        summary: "Séparer la structure du contenu et de la présentation."
      },
      {
        id: "mise-page",
        title: "Marges, sections, en-têtes et pieds de page",
        durationMinutes: 30,
        summary: "Construire une mise en page stable."
      },
      {
        id: "modeles",
        title: "Modèles et blocs réutilisables",
        durationMinutes: 25,
        summary: "Éviter de repartir d’un ancien document mal adapté."
      },
      {
        id: "collaboration",
        title: "Commentaires et suivi des modifications",
        durationMinutes: 25,
        summary: "Réviser à plusieurs sans perdre les décisions."
      },
      {
        id: "accessibilite",
        title: "Accessibilité et export PDF",
        durationMinutes: 40,
        summary: "Vérifier les titres, images, tableaux, liens et propriétés."
      }
    ]
  },
  {
    slug: "cybersecurite-reflexes-equipe",
    title: "Cybersécurité : les réflexes essentiels de l’équipe",
    shortTitle: "Réflexes cybersécurité",
    description:
      "Une formation courte pour reconnaître les demandes inhabituelles, protéger ses accès et savoir quoi faire lorsqu’un incident est possible.",
    theme: "cybersecurity",
    level: "all",
    offer: "free",
    priceLabel: "Gratuite",
    durationMinutes: 60,
    durationLabel: "Environ 1 h",
    format: "Autonome · 5 mises en situation",
    audience:
      "Employés, bénévoles et gestionnaires de PME ou d’OBNL, sans rôle technique requis.",
    outcomes: [
      "Repérer les principaux signes d’un courriel frauduleux.",
      "Protéger les comptes et les appareils de travail.",
      "Partager des fichiers et renseignements avec prudence.",
      "Signaler rapidement un événement inhabituel."
    ],
    prerequisites: ["Aucune connaissance technique préalable."],
    lessons: [
      {
        id: "pause",
        title: "Faire une pause devant l’urgence",
        durationMinutes: 12,
        summary:
          "Reconnaître les messages qui utilisent la peur, l’autorité ou une urgence artificielle.",
        sections: [
          {
            heading: "L’urgence est une technique",
            paragraphs: [
              "Les fraudes cherchent souvent à empêcher la vérification : facture à payer immédiatement, compte qui sera fermé ou dirigeant qui demande un achat inhabituel.",
              "Une pause de quelques minutes permet de vérifier la demande par un canal connu. Ne répondez pas au message suspect pour faire cette validation."
            ],
            checklist: [
              "Demande inhabituelle ou secrète.",
              "Pression pour agir immédiatement.",
              "Changement de coordonnées bancaires.",
              "Lien ou pièce jointe inattendue."
            ]
          }
        ],
        exercise:
          "Nommez la personne ou le canal que vous utiliseriez pour confirmer une demande financière urgente."
      },
      {
        id: "courriels",
        title: "Examiner un message suspect",
        durationMinutes: 12,
        summary:
          "Vérifier l’expéditeur, le contexte, les liens et les pièces jointes.",
        sections: [
          {
            heading: "Regarder l’ensemble du message",
            paragraphs: [
              "Le nom affiché peut être imité. Vérifiez l’adresse complète, puis demandez-vous si la demande correspond à une activité attendue.",
              "Sur un ordinateur, survolez un lien sans cliquer pour voir sa destination. Sur un téléphone, évitez de maintenir un lien si vous n’êtes pas certain du comportement de l’appareil."
            ],
            checklist: [
              "Adresse exacte de l’expéditeur.",
              "Demande cohérente avec le contexte.",
              "Destination du lien reconnaissable.",
              "Pièce jointe réellement attendue."
            ]
          }
        ],
        exercise:
          "Décrivez deux indices qui vous feraient transférer un message à la personne responsable de la sécurité."
      },
      {
        id: "acces",
        title: "Protéger les accès",
        durationMinutes: 12,
        summary:
          "Combiner mots de passe uniques, gestionnaire et authentification multifacteur.",
        sections: [
          {
            heading: "Réduire l’effet domino",
            paragraphs: [
              "Chaque service devrait avoir un mot de passe distinct. Un gestionnaire de mots de passe permet d’éviter les variantes prévisibles.",
              "Activez l’authentification multifacteur et ne partagez jamais un code reçu par texto ou dans une application."
            ]
          }
        ],
        exercise:
          "Vérifiez la seconde authentification du compte professionnel le plus important que vous utilisez."
      },
      {
        id: "appareils-donnees",
        title: "Appareils, fichiers et données",
        durationMinutes: 12,
        summary:
          "Garder les appareils à jour et utiliser les espaces de partage approuvés.",
        sections: [
          {
            heading: "Protéger le travail quotidien",
            paragraphs: [
              "Verrouillez votre écran lorsque vous vous éloignez et installez les mises à jour proposées par les outils approuvés.",
              "Partagez les fichiers dans les espaces prévus par l’organisation. Un lien public ou un compte personnel peut exposer des renseignements longtemps après l’envoi."
            ],
            checklist: [
              "Écran verrouillé en quittant le poste.",
              "Mises à jour installées.",
              "Fichiers transmis dans un espace approuvé.",
              "Droits de partage revus."
            ]
          }
        ],
        exercise:
          "Ouvrez les réglages de mise à jour de votre appareil et confirmez qu’ils sont actifs."
      },
      {
        id: "signaler",
        title: "Signaler sans attendre",
        durationMinutes: 12,
        summary:
          "Savoir quelles informations conserver et qui prévenir en cas de doute.",
        sections: [
          {
            heading: "Le signalement rapide protège l’équipe",
            paragraphs: [
              "Un clic accidentel ou un appareil perdu n’est pas le moment de cacher une erreur. Un signalement rapide permet de changer un accès, vérifier les journaux ou avertir les personnes concernées.",
              "Notez l’heure, le message reçu, l’action effectuée et l’appareil utilisé. Suivez ensuite la procédure de votre organisation."
            ],
            checklist: [
              "Personne ou service à contacter connu.",
              "Heure et faits conservés.",
              "Appareil laissé dans son état actuel sauf consigne contraire.",
              "Aucune enquête improvisée sur le message suspect."
            ]
          }
        ],
        exercise:
          "Ajoutez les coordonnées de signalement de votre organisation dans un endroit facile à retrouver."
      }
    ]
  },
  {
    slug: "automatisation-processus-sur-mesure",
    title: "Automatiser les tâches répétitives sans perdre le contrôle",
    shortTitle: "Automatisation sur mesure",
    description:
      "Un atelier adapté à vos outils pour cartographier un processus, choisir les bonnes automatisations et garder des validations humaines aux moments importants.",
    theme: "automation",
    level: "intermediate",
    offer: "custom",
    priceLabel: "Sur devis",
    durationMinutes: 180,
    durationLabel: "Atelier de 3 h ou parcours adapté",
    format: "En équipe · à distance ou sur place",
    audience:
      "PME, OBNL et équipes administratives qui copient les mêmes données ou répètent les mêmes suivis chaque semaine.",
    outcomes: [
      "Cartographier un processus avant de choisir un outil.",
      "Repérer les étapes répétitives et les risques d’erreur.",
      "Concevoir un premier flux avec validation humaine.",
      "Établir une mesure simple du temps économisé."
    ],
    prerequisites: [
      "Venir avec un processus réel à améliorer.",
      "Pouvoir décrire les outils et personnes actuellement impliqués."
    ],
    lessons: [
      {
        id: "cartographie",
        title: "Cartographier le processus actuel",
        durationMinutes: 45,
        summary: "Voir les entrées, décisions, transferts et résultats."
      },
      {
        id: "priorisation",
        title: "Choisir une automatisation rentable",
        durationMinutes: 35,
        summary: "Comparer fréquence, effort, risque et valeur."
      },
      {
        id: "prototype",
        title: "Prototyper un flux avec garde-fous",
        durationMinutes: 65,
        summary: "Relier les outils et prévoir les validations nécessaires."
      },
      {
        id: "mesure",
        title: "Mesurer, documenter et transmettre",
        durationMinutes: 35,
        summary: "Suivre les gains et rendre le processus maintenable."
      }
    ],
    featured: true
  }
] as const satisfies readonly TrainingCourse[];

export const trainingCourses: readonly TrainingCourse[] = courses;

export function getTrainingThemeLabel(theme: TrainingTheme) {
  return (
    trainingThemes.find((option) => option.value === theme)?.label ?? theme
  );
}

export function getTrainingLevelLabel(level: TrainingLevel) {
  return (
    trainingLevels.find((option) => option.value === level)?.label ?? level
  );
}

export function getTrainingOfferLabel(offer: TrainingOffer) {
  return (
    trainingOffers.find((option) => option.value === offer)?.label ?? offer
  );
}

export function getTrainingCourse(slug: string): TrainingCourse | null {
  return trainingCourses.find((course) => course.slug === slug) ?? null;
}

export const getCourseBySlug = getTrainingCourse;

export function getTrainingContactHref(course: TrainingCourse) {
  return `/contact?source=formation-${encodeURIComponent(course.slug)}`;
}

export function getTrainingProgressKey(courseSlug: string) {
  return `formeducweb:training-progress:v1:${courseSlug}`;
}
