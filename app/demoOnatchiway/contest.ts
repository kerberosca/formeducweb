export type PrizeTier = {
  level: number;
  minTickets: number;
  maxTickets: number;
  name: string;
  shortName: string;
  addedValue: number;
  cumulativeValue: number;
};

export type ContestConfig = {
  name: string;
  organizer: string;
  collaborator: string;
  ticketPrice: number;
  maxTickets: number;
  soldTickets: number;
  ticketingUrl: string;
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
  organizer: "Association Onatchiway",
  collaborator: "Jason Tremblay Morneau (La bête de chasse)",
  ticketPrice: 10,
  maxTickets: 10_000,
  // Modifier uniquement cette valeur pour actualiser toute la progression du site.
  soldTickets: 0,
  // Ajouter ici l'adresse complète de la billetterie lorsqu'elle sera disponible.
  ticketingUrl: "",
  salesClose: "2026-10-18T23:55:00-04:00",
  drawDate: "2026-10-19T17:00:00-04:00",
  // Ces identifiants restent invisibles tant qu'ils ne sont pas confirmés.
  racjLicense: "",
  neq: "",
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
    addedValue: 880.62,
    cumulativeValue: 880.62
  },
  {
    level: 2,
    minTickets: 1_000,
    maxTickets: 1_499,
    name: "Le système « Zone T3 orignal pro »",
    shortName: "Zone T3 orignal pro",
    addedValue: 551.87,
    cumulativeValue: 1_432.49
  },
  {
    level: 3,
    minTickets: 1_500,
    maxTickets: 1_999,
    name: "Le quadricoptère Mini 3 de DJI, télécommande et écran intégré",
    shortName: "DJI Mini 3",
    addedValue: 793.38,
    cumulativeValue: 2_225.87
  },
  {
    level: 4,
    minTickets: 2_000,
    maxTickets: 2_499,
    name: "La montre intelligente Garmin Instinct 3 Solar Tactical de 50 mm - Noir",
    shortName: "Garmin Instinct 3",
    addedValue: 804.81,
    cumulativeValue: 3_030.68
  },
  {
    level: 5,
    minTickets: 2_500,
    maxTickets: 2_999,
    name: "La scie à chaîne STIHL MS 271 et accessoires",
    shortName: "STIHL MS 271",
    addedValue: 1_010,
    cumulativeValue: 4_040.68
  },
  {
    level: 6,
    minTickets: 3_000,
    maxTickets: 3_999,
    name: "Le treuil à essence Portable Winch PCW3000-A",
    shortName: "Portable Winch PCW3000-A",
    addedValue: 1_943.02,
    cumulativeValue: 5_983.7
  },
  {
    level: 7,
    minTickets: 4_000,
    maxTickets: 10_000,
    name: "L'ensemble débroussailleuse STIHL FS 460 C-EM K et harnais ADVANCE X-Treem",
    shortName: "STIHL FS 460 + harnais",
    addedValue: 2_184.5,
    cumulativeValue: 8_168.2
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
      "L'émission maximale absolue est strictement limitée à 10 000 billets électroniques. La valeur nominale et le prix d'achat de chaque billet unique demeurent fixes à 10,00 $ CAD, toutes taxes incluses, pendant toute la durée de l'activité."
    ]
  },
  {
    number: 2,
    title: "Structure progressive par paliers",
    paragraphs: [
      "Le tirage comporte une structure de prix cumulative et progressive à gagnant unique, déterminée exclusivement par le nombre total de billets admissibles vendus à la date et à l'heure de clôture. Un seul billet sera pigé pour remporter l'intégralité du lot accumulé.",
      "Palier 1 (1 à 999 billets) - garanti : ensemble « La bête de chasse », valeur de 880,62 $. Palier 2 (1 000 à 1 499) : ajout du système « Zone T3 orignal pro », total de 1 432,49 $. Palier 3 (1 500 à 1 999) : ajout du quadricoptère Mini 3 de DJI, total de 2 225,87 $. Palier 4 (2 000 à 2 499) : ajout de la montre Garmin Instinct 3 Solar Tactical, total de 3 030,68 $.",
      "Palier 5 (2 500 à 2 999) : ajout de la scie à chaîne STIHL MS 271 et accessoires, total corrigé de 4 040,68 $. Palier 6 (3 000 à 3 999) : ajout du treuil Portable Winch PCW3000-A, total de 5 983,70 $. Palier 7 (4 000 à 10 000) : ajout de l'ensemble débroussailleuse STIHL FS 460 C-EM K et harnais ADVANCE X-Treem, valeur totale maximale de 8 168,20 $."
    ]
  },
  {
    number: 3,
    title: "Clôture définitive des ventes",
    paragraphs: [
      "La vente des billets se terminera de manière absolue le dimanche 18 octobre 2026 à 23 h 55. Aucun billet ne pourra être émis ou vendu après cette échéance."
    ]
  },
  {
    number: 4,
    title: "Date, heure et lieu du tirage",
    paragraphs: [
      "Le tirage aura lieu le lundi 19 octobre 2026 à 17 h, au bureau de l'Association Onatchiway, au moyen d'un algorithme de tirage électronique certifié qui sélectionnera au hasard un numéro unique parmi les billets officiellement vendus."
    ]
  },
  {
    number: 5,
    title: "Transparence et témoins",
    paragraphs: [
      "L'exécution de la pige électronique s'effectuera publiquement, en direct sur les réseaux sociaux officiels de l'organisme, devant au moins trois témoins officiels qui signeront le procès-verbal du tirage."
    ]
  },
  {
    number: 6,
    title: "Gagnant unique",
    paragraphs: [
      "Un seul billet sera pigé. Son détenteur remportera l'ensemble des prix déverrouillés selon le palier atteint à la clôture. Les billets non vendus sont exclus de la pige."
    ]
  },
  {
    number: 7,
    title: "Paliers non atteints",
    paragraphs: [
      "Les prix associés aux paliers supérieurs non débloqués ne seront pas tirés et demeureront la propriété exclusive de l'Association Onatchiway."
    ]
  },
  {
    number: 8,
    title: "Nature des lots",
    paragraphs: [
      "Tous les prix décernés sont strictement non échangeables, non transférables et non monnayables."
    ]
  },
  {
    number: 9,
    title: "Délai de réclamation",
    paragraphs: [
      "Le gagnant doit communiquer avec le bureau de l'Association Onatchiway et présenter le billet électronique officiel reçu lors de l'achat. Il dispose de 60 jours après le tirage, soit jusqu'au vendredi 18 décembre 2026 inclusivement, pour réclamer ses prix."
    ]
  },
  {
    number: 10,
    title: "Disqualification et gagnant substitut",
    paragraphs: [
      "Si le gagnant ne peut être joint, ne réclame pas ses prix dans le délai prescrit ou s'avère inadmissible, une nouvelle pige électronique sera effectuée selon les mêmes modalités afin de désigner un gagnant substitut unique."
    ]
  },
  {
    number: 11,
    title: "Vocation des fonds",
    paragraphs: [
      "L'intégralité des bénéfices nets de la vente des billets sera affectée à la mission communautaire de l'organisme, soit l'amélioration des infrastructures et du territoire de l'Association Onatchiway."
    ]
  },
  {
    number: 12,
    title: "Exclusion des organisateurs",
    paragraphs: [
      "Les employés réguliers et contractuels, les membres du conseil d'administration en fonction ainsi que les personnes résidant sous le même toit ne peuvent acheter de billets ni réclamer un prix."
    ]
  },
  {
    number: 13,
    title: "Autorisation de publication",
    paragraphs: [
      "En participant, le gagnant consent à la publication de son nom complet, de sa municipalité de résidence et de son image photographique par l'Association Onatchiway à des fins promotionnelles gratuites."
    ]
  },
  {
    number: 14,
    title: "Force majeure",
    paragraphs: [
      "En cas de force majeure ou de panne technologique majeure, l'Association Onatchiway pourra reporter le tirage uniquement après avoir obtenu l'autorisation écrite préalable de la RACJ."
    ]
  },
  {
    number: 15,
    title: "Règlement des différends",
    paragraphs: [
      "Tout différend relatif à l'organisation, à la conduite ou à l'attribution des prix sera soumis à l'arbitrage de la Régie des alcools, des courses et des jeux du Québec, dont la décision est finale et sans appel."
    ]
  },
  {
    number: 16,
    title: "Lois applicables et non-remboursement",
    paragraphs: [
      "Le tirage est régi par le Code criminel canadien et la Loi sur les loteries du Québec. Aucune annulation ni aucun remboursement ne sera accepté après l'émission du reçu électronique. Toute transaction frauduleuse entraînera l'annulation du billet associé."
    ]
  },
  {
    number: 17,
    title: "Conservation des registres et audit",
    paragraphs: [
      "L'Association Onatchiway conservera les données informatiques, les listes de transactions financières et les procès-verbaux de tirage pendant au moins trois ans après le tirage et les mettra à la disposition des inspecteurs de la RACJ sur demande."
    ]
  },
  {
    number: 18,
    title: "Renseignements personnels et cybersécurité",
    paragraphs: [
      "Les renseignements personnels recueillis lors de l'achat seront traités de manière confidentielle et sécurisée conformément aux lois québécoises applicables. La plateforme transactionnelle doit chiffrer les données bancaires et aucune information de carte de crédit ne sera conservée par l'organisme."
    ]
  },
  {
    number: 19,
    title: "Disponibilité et substitution des prix",
    paragraphs: [
      "Si l'un des prix annoncés n'est plus disponible, est en rupture de stock ou cesse d'être fabriqué, le gagnant recevra un prix similaire de modèle équivalent ou supérieur et d'une valeur marchande égale ou supérieure."
    ]
  },
  {
    number: 20,
    title: "Plateforme de vente",
    paragraphs: [
      "La plateforme transactionnelle utilisée est gratuite pour l'organisme et lui reverse 100 % du montant des billets. Un don optionnel destiné au fonctionnement de la plateforme peut être ajouté par défaut; l'acheteur peut le modifier ou le ramener à 0 $ avant le paiement."
    ]
  },
  {
    number: 21,
    title: "Note fiscale",
    paragraphs: [
      "L'achat de billets de tirage ne donne pas droit à un reçu pour don déductible d'impôt."
    ]
  },
  {
    number: 22,
    title: "Limitation de responsabilité civile",
    paragraphs: [
      "La responsabilité civile de l'organisme ou des organisateurs envers un participant ne pourra excéder le prix d'achat réel du billet admissible payé par ce dernier, soit 10,00 $ CAD."
    ]
  },
  {
    number: 23,
    title: "Dysfonctionnements techniques",
    paragraphs: [
      "L'organisme ne peut être tenu responsable des défaillances informatiques, bogues de serveurs, interruptions de réseau, pannes de transmission, cyberattaques de tiers ou blocages administratifs imposés par les plateformes de diffusion ou de billetterie qui échappent à son contrôle raisonnable."
    ]
  },
  {
    number: 24,
    title: "Fin de responsabilité et garanties",
    paragraphs: [
      "Dès la livraison et la prise de possession des prix, l'organisme est libéré de toute responsabilité future liée à leur utilisation, leur fonctionnement, leurs vices cachés ou aux accidents qui pourraient en découler. Le gagnant accepte les prix tels quels et doit se référer aux garanties des manufacturiers d'origine."
    ]
  }
];
