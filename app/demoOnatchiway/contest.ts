export type PrizeTier = {
  level: number;
  minTickets: number;
  maxTickets: number;
  name: string;
  shortName: string;
  description: string;
  addedValue: number;
  cumulativeValue: number;
  image: string;
  imageAlt: string;
  imagePosition: string;
};

export type ContestConfig = {
  name: string;
  organizer: string;
  collaborator: string;
  ticketPrice: number;
  maxTickets: number;
  soldTickets: number;
  ticketingUrl: string;
  ticketingPlatform: string;
  salesClose: string;
  drawDate: string;
  racjLicense: string;
  neq: string;
  contact: {
    address: string;
    city: string;
    phone: string;
    phoneHref: string;
    email: string;
    facebook: string;
  };
};

export type OfficialRule = {
  number: number;
  title: string;
  paragraphs: string[];
};

export const contestConfig: ContestConfig = {
  name: "L'Appel d'Onatchiway",
  organizer: "Association sportive Onatchiway Est inc.",
  collaborator: "Jason Tremblay Morneau (La bête de chasse)",
  ticketPrice: 10,
  maxTickets: 10_000,
  // Modifier uniquement cette valeur pour actualiser toute la progression du site.
  soldTickets: 0,
  // Adresse officielle de la campagne de billetterie.
  ticketingUrl: "https://tirage.moitiemoitie.com/901",
  ticketingPlatform: "moitiermoitier.com",
  salesClose: "2026-10-18T23:55:00-04:00",
  drawDate: "2026-10-19T17:00:00-04:00",
  // La licence RACJ demeure invisible tant que son numéro n'est pas confirmé.
  racjLicense: "",
  neq: "114 207 3668",
  contact: {
    address: "2496, rue Dubose",
    city: "Jonquière (Québec) G7S 1B4",
    phone: "418-548-0812",
    phoneHref: "+14185480812",
    email: "zeconatchiway@videotron.ca",
    facebook: "https://www.facebook.com/zeconatchiway"
  }
};

export const prizeTiers: PrizeTier[] = [
  {
    level: 1,
    minTickets: 1,
    maxTickets: 999,
    name: "L'ensemble « La bête de chasse »",
    shortName: "La bête de chasse",
    description:
      "Sélection officielle de Jason Tremblay Morneau réunissant formation et vêtements de chasse.",
    addedValue: 880.62,
    cumulativeValue: 880.62,
    image: "/demoOnatchiway/prix-palier-1.png",
    imageAlt: "Manteau et pantalon de chasse de la collection J.T. Moose",
    imagePosition: "center"
  },
  {
    level: 2,
    minTickets: 1_000,
    maxTickets: 1_499,
    name: "Le système « Traîneau à orignal pro » de Zone T3",
    shortName: "Traîneau à orignal pro",
    description:
      "Un système conçu pour faciliter l'évacuation forestière d'un orignal en terrain difficile.",
    addedValue: 551.87,
    cumulativeValue: 1_432.49,
    image: "/demoOnatchiway/prix-palier-2.png",
    imageAlt: "Système orange Traîneau à orignal pro de Zone T3",
    imagePosition: "center"
  },
  {
    level: 3,
    minTickets: 1_500,
    maxTickets: 1_999,
    name: "Le quadricoptère Mini 3 de DJI avec télécommande intelligente",
    shortName: "DJI Mini 3",
    description:
      "Ensemble avec télécommande et écran HD intégré pour voir le vol sans téléphone.",
    addedValue: 793.38,
    cumulativeValue: 2_225.87,
    image: "/demoOnatchiway/prix-palier-3.png",
    imageAlt: "Drone DJI Mini 3 avec télécommande et accessoires",
    imagePosition: "center"
  },
  {
    level: 4,
    minTickets: 2_000,
    maxTickets: 2_499,
    name: "La montre Garmin Instinct 3 Solar Tactical de 50 mm",
    shortName: "Garmin Instinct 3",
    description:
      "Montre intelligente multisport Bluetooth à recharge solaire, boîtier robuste et fini noir.",
    addedValue: 804.81,
    cumulativeValue: 3_030.68,
    image: "/demoOnatchiway/prix-palier-4.png",
    imageAlt: "Montre noire Garmin Instinct 3 Solar Tactical",
    imagePosition: "center"
  },
  {
    level: 5,
    minTickets: 2_500,
    maxTickets: 2_999,
    name: "La scie à chaîne STIHL MS 271 et accessoires",
    shortName: "STIHL MS 271",
    description:
      "Modèle avec guide-chaîne de 16 po et sélection d'accessoires pour compléter l'ensemble.",
    addedValue: 1_007.83,
    cumulativeValue: 4_038.51,
    image: "/demoOnatchiway/prix-palier-5.png",
    imageAlt: "Scie à chaîne STIHL MS 271 avec guide-chaîne",
    imagePosition: "center"
  },
  {
    level: 6,
    minTickets: 3_000,
    maxTickets: 3_999,
    name: "Le treuil à essence Portable Winch PCW3000-A",
    shortName: "Portable Winch PCW3000-A",
    description:
      "Ensemble de treuil portatif à essence avec moteur Honda et accessoires de traction.",
    addedValue: 1_943.02,
    cumulativeValue: 5_981.53,
    image: "/demoOnatchiway/prix-palier-6.png",
    imageAlt:
      "Treuil portatif à essence Portable Winch PCW3000-A et accessoires",
    imagePosition: "center"
  },
  {
    level: 7,
    minTickets: 4_000,
    maxTickets: 10_000,
    name: "L'ensemble débroussailleuse STIHL FS 460 C-EM K et harnais ADVANCE X-Treem",
    shortName: "STIHL FS 460 + harnais",
    description:
      "Débroussailleuse professionnelle accompagnée du harnais ergonomique ADVANCE X-Treem.",
    addedValue: 2_104.02,
    cumulativeValue: 8_085.55,
    image: "/demoOnatchiway/prix-palier-7.png",
    imageAlt: "Débroussailleuse STIHL FS 460 C-EM K",
    imagePosition: "center"
  }
];

export function clampTicketCount(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(contestConfig.maxTickets, Math.max(0, Math.floor(value)));
}

export function getContestState(value: number) {
  const soldTickets = clampTicketCount(value);
  const unlockedTiers = prizeTiers.filter(
    (tier) => tier.level === 1 || soldTickets >= tier.minTickets
  );
  const currentTier = unlockedTiers.at(-1) ?? prizeTiers[0];
  const nextTier = prizeTiers.find(
    (tier) => tier.level > 1 && tier.minTickets > soldTickets
  );

  return {
    soldTickets,
    unlockedTiers,
    currentTier,
    nextTier: nextTier ?? null,
    progressPercent: (soldTickets / contestConfig.maxTickets) * 100
  };
}

export function getCountdown(deadline: string, now: Date) {
  const remaining = Math.max(0, Date.parse(deadline) - now.getTime());
  const totalSeconds = Math.floor(remaining / 1_000);

  return {
    closed: remaining <= 0,
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor((totalSeconds % 86_400) / 3_600),
    minutes: Math.floor((totalSeconds % 3_600) / 60),
    seconds: totalSeconds % 60
  };
}

export function getTicketAction(
  ticketingUrl: string,
  deadline: string,
  now: Date
) {
  if (getCountdown(deadline, now).closed) return "closed" as const;
  if (!ticketingUrl.trim()) return "unavailable" as const;
  return "active" as const;
}

export const officialRules: OfficialRule[] = [
  {
    number: 1,
    title: "Émission et prix des billets",
    paragraphs: [
      "L'émission maximale absolue est strictement limitée à 10 000 billets électroniques. Le prix d'achat de chaque billet unique demeure fixe à 10,00 $ CAD, toutes taxes incluses, pendant toute la durée de l'activité. La vente est libre sans limite d'achat par personne. Aucun frais additionnel n'est exigé hormis le prix du billet."
    ]
  },
  {
    number: 2,
    title: "Méthode d'évaluation légale des lots",
    paragraphs: [
      "Toutes les valeurs marchandes déclarées ont été établies d'après les prix de détail suggérés par les fabricants sur leurs sites Web officiels canadiens, taxes incluses."
    ]
  },
  {
    number: 3,
    title: "Structure progressive par paliers",
    paragraphs: [
      "Le tirage comporte une structure de prix cumulative et progressive. Un seul et unique billet sera pigé au sort. Le détenteur de ce billet remporte l'intégralité des prix déverrouillés selon le palier officiellement atteint à la clôture de la vente.",
      "Palier 1 (1 à 999 billets), garanti : ensemble « La bête de chasse », total de 880,62 $. Palier 2 (1 000 à 1 499) : ajout du système « Zone T3 orignal pro », total de 1 432,49 $. Palier 3 (1 500 à 1 999) : ajout du DJI Mini 3, total de 2 225,87 $. Palier 4 (2 000 à 2 499) : ajout de la Garmin Instinct 3 Solar Tactical, total de 3 030,68 $.",
      "Palier 5 (2 500 à 2 999) : ajout de la STIHL MS 271 et accessoires, total de 4 038,51 $. Palier 6 (3 000 à 3 999) : ajout du Portable Winch PCW3000-A, total de 5 981,53 $. Palier 7 (4 000 à 10 000) : ajout de la débroussailleuse STIHL FS 460 C-EM K et du harnais ADVANCE X-Treem, valeur totale maximale de 8 085,55 $.",
      "Les participants pourront vérifier le palier atteint en temps réel sur la page d'achat officielle moitiermoitier.com, sur la page Web officielle du tirage et sur la page Facebook de la ZEC Onatchiway."
    ]
  },
  {
    number: 4,
    title: "Géographie et âge",
    paragraphs: [
      "La participation est réservée aux résidents de la province de Québec âgés de 18 ans et plus à la date de la transaction."
    ]
  },
  {
    number: 5,
    title: "Preuve d'identité officielle obligatoire",
    paragraphs: [
      "Le gagnant devra fournir une preuve d'identité officielle valide avec photo, comme un permis de conduire ou une carte d'assurance-maladie, afin de confirmer sa majorité et sa résidence."
    ]
  },
  {
    number: 6,
    title: "Exclusion des organisateurs",
    paragraphs: [
      "Les employés, les administrateurs de l'association et les personnes résidant sous le même toit sont exclus."
    ]
  },
  {
    number: 7,
    title: "Processus d'émission",
    paragraphs: [
      "Chaque billet électronique portant un numéro unique est transmis automatiquement par courriel après l'achat."
    ]
  },
  {
    number: 8,
    title: "Cybersécurité",
    paragraphs: [
      "La transaction est chiffrée par la plateforme moitiermoitier.com. Aucune donnée bancaire n'est conservée par l'association."
    ]
  },
  {
    number: 9,
    title: "Conformité à la Loi 25",
    paragraphs: [
      "La plateforme d'émission utilisée, moitiermoitier.com, traite les renseignements personnels conformément aux exigences québécoises applicables en matière de protection des renseignements personnels."
    ]
  },
  {
    number: 10,
    title: "Clôture définitive des ventes",
    paragraphs: [
      "La vente des billets se termine le dimanche 18 octobre 2026 à 23 h 55, heure du Québec."
    ]
  },
  {
    number: 11,
    title: "Date, heure et lieu du tirage",
    paragraphs: [
      "Le tirage aura lieu le lundi 19 octobre 2026 à 17 h au bureau de l'association, au moyen d'un algorithme certifié."
    ]
  },
  {
    number: 12,
    title: "Transparence et témoins",
    paragraphs: [
      "Le tirage s'effectuera publiquement en direct sur les réseaux sociaux devant un minimum de trois témoins."
    ]
  },
  {
    number: 13,
    title: "Procès-verbal",
    paragraphs: [
      "Un document détaillé consignera la date, l'heure, le nombre de billets vendus, le numéro du gagnant et l'identité des témoins."
    ]
  },
  {
    number: 14,
    title: "Principe du gagnant unique",
    paragraphs: [
      "Un seul billet sera pigé pour l'ensemble du lot accumulé. Les billets invendus sont exclus de la pige."
    ]
  },
  {
    number: 15,
    title: "Paliers non atteints et déblocage des lots",
    paragraphs: [
      "Le déverrouillage est déterminé exclusivement par le nombre total de billets vendus. Les articles rattachés aux paliers non débloqués sont exclus du tirage et demeurent la propriété de l'association.",
      "Exemple : si la vente se termine avec 1 200 billets vendus, le gagnant remporte les prix cumulés des paliers 1 et 2. Les lots des paliers 3 à 7 ne sont pas mis en jeu."
    ]
  },
  {
    number: 16,
    title: "Nature des lots",
    paragraphs: [
      "Les lots sont strictement non échangeables, non transférables et non monnayables."
    ]
  },
  {
    number: 17,
    title: "Délai de réclamation",
    paragraphs: [
      "Le gagnant dispose de 60 jours suivant le tirage, soit jusqu'au vendredi 18 décembre 2026 inclusivement, pour réclamer son prix."
    ]
  },
  {
    number: 18,
    title: "Disqualification",
    paragraphs: [
      "Si le gagnant est injoignable ou inadmissible, une nouvelle pige électronique sera effectuée afin de désigner un gagnant substitut unique."
    ]
  },
  {
    number: 19,
    title: "Vocation des fonds",
    paragraphs: [
      "Cent pour cent des bénéfices nets soutiennent la mission de l'Association sportive Onatchiway Est inc."
    ]
  },
  {
    number: 20,
    title: "Autorisation de publication",
    paragraphs: [
      "Le gagnant consent à la publication de son nom, de sa municipalité et de son image à des fins promotionnelles gratuites."
    ]
  },
  {
    number: 21,
    title: "Force majeure et interruption technologique",
    paragraphs: [
      "En cas de force majeure, l'association peut reporter le tirage sous réserve d'une autorisation préalable de la RACJ."
    ]
  },
  {
    number: 22,
    title: "Droit de contrôle gouvernemental",
    paragraphs: [
      "La RACJ peut procéder à toute inspection ou à tout audit à tout moment durant l'activité."
    ]
  },
  {
    number: 23,
    title: "Limitation réglementaire de responsabilité",
    paragraphs: [
      "La RACJ n'assume aucune responsabilité quant à l'organisation ou à la conduite du tirage."
    ]
  },
  {
    number: 24,
    title: "Mécanisme de gestion des plaintes",
    paragraphs: [
      "Toute plainte doit d'abord être adressée par écrit au conseil d'administration de l'association. Si le différend persiste, il sera soumis à l'arbitrage final de la RACJ."
    ]
  },
  {
    number: 25,
    title: "Lois applicables et non-remboursement",
    paragraphs: [
      "Le tirage est régi par le Code criminel canadien et la Loi sur les loteries du Québec. Aucun remboursement n'est accordé après l'émission du reçu électronique. Toute fraude annule le billet associé."
    ]
  },
  {
    number: 26,
    title: "Conservation des registres et audit",
    paragraphs: [
      "Les données et les procès-verbaux seront conservés pendant trois ans pour les inspecteurs de la RACJ."
    ]
  },
  {
    number: 27,
    title: "Disponibilité et substitution",
    paragraphs: [
      "En cas de rupture de stock, un lot peut être remplacé par un lot de valeur équivalente ou supérieure."
    ]
  },
  {
    number: 28,
    title: "Limitation de responsabilité civile",
    paragraphs: [
      "La responsabilité civile ne pourra excéder le prix d'achat réel du billet admissible, soit 10,00 $ CAD."
    ]
  },
  {
    number: 29,
    title: "Dysfonctionnements techniques",
    paragraphs: [
      "L'organisme n'est pas responsable des pannes de serveurs ou de réseau hors de son contrôle, notamment celles de moitiermoitier.com ou de Facebook."
    ]
  },
  {
    number: 30,
    title: "Procédure en cas d'erreur système",
    paragraphs: [
      "En cas d'erreur d'émission, l'association peut annuler et remplacer le billet concerné."
    ]
  },
  {
    number: 31,
    title: "Fin de responsabilité et garanties",
    paragraphs: [
      "Dès la prise de possession officielle des prix, l'organisme est libéré de toute obligation. Le gagnant accepte les prix tels quels et bénéficie des garanties offertes par les manufacturiers."
    ]
  }
];
