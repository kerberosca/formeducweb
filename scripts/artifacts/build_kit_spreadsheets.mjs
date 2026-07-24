import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(currentDir, "../..");
const outputDir = path.join(root, "assets", "kit-templates");
const previewDir = path.join(root, "public", "exemples", "apercus");

const colors = {
  blue: "#1571D4",
  navy: "#16263B",
  orange: "#FD8417",
  paleBlue: "#EAF3FC",
  paleOrange: "#FFF1E4",
  gray: "#5F6B7A",
  light: "#D9E2EC",
  white: "#FFFFFF"
};

await fs.mkdir(outputDir, { recursive: true });
await fs.mkdir(previewDir, { recursive: true });

function styleTitle(sheet, title, subtitle, endColumn = "H") {
  sheet.showGridLines = false;
  sheet.getRange(`A1:${endColumn}1`).merge();
  sheet.getRange("A1").values = [[title]];
  sheet.getRange(`A1:${endColumn}1`).format = {
    fill: colors.navy,
    font: { bold: true, color: colors.white, size: 18 },
    verticalAlignment: "center"
  };
  sheet.getRange(`A1:${endColumn}1`).format.rowHeight = 34;
  sheet.getRange(`A2:${endColumn}2`).merge();
  sheet.getRange("A2").values = [[subtitle]];
  sheet.getRange(`A2:${endColumn}2`).format = {
    fill: colors.paleBlue,
    font: { italic: true, color: colors.gray, size: 10 },
    wrapText: true
  };
  sheet.getRange(`A2:${endColumn}2`).format.rowHeight = 32;
  sheet.getRange("A3:B5").values = [
    ["Entreprise", "{{COMPANY_NAME}}"],
    ["Responsable", "{{CONTACT_NAME}}"],
    ["Généré le", "{{GENERATED_DATE}}"]
  ];
  sheet.getRange("A3:A5").format = {
    fill: colors.paleOrange,
    font: { bold: true, color: colors.navy }
  };
  sheet.getRange("B3:B5").format = {
    fill: "#F8FAFC",
    font: { color: colors.navy }
  };
  sheet.getRange("A3:B5").format.borders = {
    preset: "all",
    style: "thin",
    color: colors.light
  };
  sheet.getRange(`C3:${endColumn}5`).merge();
  sheet.getRange("C3").values = [
    ["Priorité issue du diagnostic\n{{TOP_ACTION_1}}"]
  ];
  sheet.getRange(`C3:${endColumn}5`).format = {
    fill: colors.paleBlue,
    font: { color: colors.navy, size: 10 },
    wrapText: true,
    verticalAlignment: "center"
  };
  sheet.getRange(`C3:${endColumn}5`).format.borders = {
    preset: "all",
    style: "thin",
    color: colors.light
  };
}

function styleTable(sheet, range, headerRange) {
  sheet.getRange(headerRange).format = {
    fill: colors.blue,
    font: { bold: true, color: colors.white, size: 9 },
    wrapText: true,
    verticalAlignment: "center"
  };
  sheet.getRange(headerRange).format.rowHeight = 32;
  sheet.getRange(range).format.borders = {
    preset: "all",
    style: "thin",
    color: colors.light
  };
  sheet.getRange(range).format.wrapText = true;
  sheet.getRange(range).format.verticalAlignment = "top";
}

async function saveAndRender(workbook, fileName, sheets) {
  const exported = await SpreadsheetFile.exportXlsx(workbook);
  await exported.save(path.join(outputDir, fileName));
  for (const sheetName of sheets) {
    const preview = await workbook.render({
      sheetName,
      autoCrop: "all",
      scale: 1,
      format: "png"
    });
    const safeName = `${fileName.replace(".xlsx", "")}-${sheetName
      .toLowerCase()
      .replaceAll(" ", "-")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")}.png`;
    await fs.writeFile(
      path.join(previewDir, safeName),
      new Uint8Array(await preview.arrayBuffer())
    );
  }
  console.log(`Exported and rendered ${fileName}`);
}

async function buildAiRegister() {
  const workbook = Workbook.create();
  const sheet = workbook.worksheets.add("Registre IA");
  styleTitle(
    sheet,
    "Registre des usages d’intelligence artificielle",
    "Consignez les usages significatifs, les données utilisées, la validation et la décision. Exemple fictif à remplacer.",
    "K"
  );
  const headers = [
    "ID",
    "Date",
    "Équipe",
    "Cas d’usage",
    "Outil",
    "Données utilisées",
    "Validation humaine",
    "Statut",
    "Responsable",
    "Prochaine revue",
    "Notes / décision"
  ];
  const examples = [
    [
      "IA-001",
      new Date("2026-07-15"),
      "Marketing",
      "Préparer le plan d’une infolettre",
      "Outil approuvé",
      "Contenu public uniquement",
      "Révision des faits et du ton",
      "Pilote",
      "{{CONTACT_NAME}}",
      new Date("2026-08-15"),
      "Exemple fictif — mesurer le temps économisé"
    ],
    [
      "IA-002",
      new Date("2026-07-18"),
      "Opérations",
      "Résumer une procédure interne anonymisée",
      "Outil approuvé",
      "Aucune donnée personnelle",
      "Comparaison avec le document source",
      "À revoir",
      "{{CONTACT_NAME}}",
      new Date("2026-08-01"),
      "Exemple fictif — confirmer les droits d’accès"
    ]
  ];
  sheet.getRange("A7:K9").values = [headers, ...examples];
  styleTable(sheet, "A7:K32", "A7:K7");
  sheet.getRange("B8:B32").format.numberFormat = "yyyy-mm-dd";
  sheet.getRange("J8:J32").format.numberFormat = "yyyy-mm-dd";
  sheet.getRange("H8:H32").dataValidation = {
    rule: {
      type: "list",
      values: ["Idée", "Pilote", "Approuvé", "À revoir", "Retiré"]
    }
  };
  const widths = [10, 12, 16, 30, 20, 28, 28, 14, 18, 14, 34];
  widths.forEach((width, index) => {
    sheet.getRangeByIndexes(0, index, 32, 1).format.columnWidth = width;
  });
  sheet.freezePanes.freezeRows(7);
  await saveAndRender(workbook, "registre-usages-ia.xlsx", ["Registre IA"]);
}

async function buildCyberChecklist() {
  const workbook = Workbook.create();
  const summary = workbook.worksheets.add("Sommaire");
  const access = workbook.worksheets.add("Accès");
  const backups = workbook.worksheets.add("Sauvegardes");

  styleTitle(
    summary,
    "Checklist accès et sauvegardes",
    "Pilotez les mesures de base pendant 90 jours. Les exemples sont fictifs et doivent être validés.",
    "H"
  );
  summary.getRange("A8:B11").values = [
    ["Indicateur", "Valeur"],
    ["Contrôles accès terminés", null],
    ["Contrôles sauvegarde terminés", null],
    ["Contrôles en retard", null]
  ];
  summary.getRange("B9").formulas = [
    ["=COUNTIF('Accès'!$F$8:$F$27,\"Terminé\")"]
  ];
  summary.getRange("B10").formulas = [
    ["=COUNTIF('Sauvegardes'!$F$8:$F$27,\"Terminé\")"]
  ];
  summary.getRange("B11").formulas = [
    [
      "=COUNTIF('Accès'!$F$8:$F$27,\"En retard\")+COUNTIF('Sauvegardes'!$F$8:$F$27,\"En retard\")"
    ]
  ];
  styleTable(summary, "A8:B11", "A8:B8");
  summary.getRange("A8:A11").format.columnWidth = 30;
  summary.getRange("B8:B11").format.columnWidth = 14;

  const configureChecklist = (sheet, title, examples) => {
    styleTitle(
      sheet,
      title,
      "Attribuez un propriétaire, une preuve et une échéance. « Terminé » signifie vérifié, pas seulement déclaré.",
      "H"
    );
    const headers = [
      "ID",
      "Contrôle",
      "Critère de réussite",
      "Responsable",
      "Échéance",
      "Statut",
      "Preuve / lien",
      "Prochaine vérification"
    ];
    sheet.getRange("A7:H10").values = [headers, ...examples];
    styleTable(sheet, "A7:H27", "A7:H7");
    sheet.getRange("E8:E27").format.numberFormat = "yyyy-mm-dd";
    sheet.getRange("H8:H27").format.numberFormat = "yyyy-mm-dd";
    sheet.getRange("F8:F27").dataValidation = {
      rule: {
        type: "list",
        values: [
          "À faire",
          "En cours",
          "Terminé",
          "En retard",
          "Non applicable"
        ]
      }
    };
    [10, 31, 34, 18, 14, 15, 28, 18].forEach((width, index) => {
      sheet.getRangeByIndexes(0, index, 27, 1).format.columnWidth = width;
    });
    sheet.freezePanes.freezeRows(7);
  };

  configureChecklist(access, "Contrôles d’accès", [
    [
      "ACC-01",
      "MFA sur les comptes critiques",
      "MFA actif et testé pour chaque administrateur",
      "{{CONTACT_NAME}}",
      new Date("2026-08-01"),
      "En cours",
      "Exemple fictif — ajouter une preuve interne",
      new Date("2026-10-01")
    ],
    [
      "ACC-02",
      "Départ d’un employé",
      "Checklist de retrait testée sur un cas fictif",
      "{{CONTACT_NAME}}",
      new Date("2026-08-15"),
      "À faire",
      "Exemple fictif",
      new Date("2026-11-15")
    ]
  ]);
  configureChecklist(backups, "Contrôles de sauvegarde", [
    [
      "SAU-01",
      "Sauvegarde des données essentielles",
      "Portée, fréquence et responsable documentés",
      "{{CONTACT_NAME}}",
      new Date("2026-08-01"),
      "En cours",
      "Exemple fictif — ne pas inscrire de secret",
      new Date("2026-09-01")
    ],
    [
      "SAU-02",
      "Test de restauration",
      "Restauration d’un échantillon réussie et chronométrée",
      "{{CONTACT_NAME}}",
      new Date("2026-08-30"),
      "À faire",
      "Exemple fictif",
      new Date("2026-11-30")
    ]
  ]);
  await saveAndRender(workbook, "checklist-acces-sauvegardes.xlsx", [
    "Sommaire",
    "Accès",
    "Sauvegardes"
  ]);
}

async function buildLaw25Inventory() {
  const workbook = Workbook.create();
  const sheet = workbook.worksheets.add("Inventaire");
  styleTitle(
    sheet,
    "Inventaire des renseignements personnels",
    "Cartographiez ce qui est collecté, pourquoi, où, par qui et pour combien de temps. Exemple fictif à remplacer.",
    "M"
  );
  const headers = [
    "ID",
    "Processus",
    "Catégories de renseignements",
    "Personnes concernées",
    "Finalité",
    "Source",
    "Système / fournisseur",
    "Accès autorisés",
    "Transfert hors Québec",
    "Durée / règle de conservation",
    "Sensibilité",
    "Responsable",
    "Action à prendre"
  ];
  const examples = [
    [
      "DON-001",
      "Formulaire de contact",
      "Nom, courriel, entreprise, message",
      "Prospects",
      "Répondre à une demande",
      "Formulaire web",
      "Boîte de réception approuvée",
      "Équipe service",
      "À vérifier",
      "À documenter",
      "Modérée",
      "{{CONTACT_NAME}}",
      "Exemple fictif — confirmer fournisseur et conservation"
    ],
    [
      "DON-002",
      "Facturation",
      "Coordonnées d’affaires et historique",
      "Clients",
      "Facturer et tenir les registres requis",
      "Client / système comptable",
      "Outil comptable approuvé",
      "Administration",
      "À vérifier",
      "Selon obligations et politique",
      "Élevée",
      "{{CONTACT_NAME}}",
      "Exemple fictif — valider les accès"
    ]
  ];
  sheet.getRange("A7:M9").values = [headers, ...examples];
  styleTable(sheet, "A7:M37", "A7:M7");
  sheet.getRange("K8:K37").dataValidation = {
    rule: {
      type: "list",
      values: ["Faible", "Modérée", "Élevée", "Très élevée"]
    }
  };
  [10, 21, 31, 20, 30, 20, 27, 24, 18, 26, 14, 18, 34].forEach(
    (width, index) => {
      sheet.getRangeByIndexes(0, index, 37, 1).format.columnWidth = width;
    }
  );
  sheet.freezePanes.freezeRows(7);
  await saveAndRender(workbook, "inventaire-donnees-loi25.xlsx", [
    "Inventaire"
  ]);
}

async function buildLaw25IncidentRegister() {
  const workbook = Workbook.create();
  const sheet = workbook.worksheets.add("Incidents");
  styleTitle(
    sheet,
    "Registre des incidents de confidentialité",
    "Consignez les faits, l’évaluation et les mesures. Évitez d’y inscrire des secrets ou données personnelles non nécessaires.",
    "M"
  );
  const headers = [
    "ID",
    "Détecté le",
    "Description factuelle",
    "Renseignements concernés",
    "Personnes concernées",
    "Mesures immédiates",
    "Risque de préjudice sérieux",
    "Motifs de l’évaluation",
    "Notifications / communications",
    "Responsable",
    "Statut",
    "Clôturé le",
    "Actions préventives"
  ];
  const example = [
    "INC-001",
    new Date("2026-07-20"),
    "Exemple fictif — message envoyé au mauvais destinataire interne",
    "Coordonnée d’affaires",
    "1",
    "Accès retiré et destinataire contacté",
    "À évaluer",
    "Exemple fictif — documenter les facteurs retenus",
    "À déterminer",
    "{{CONTACT_NAME}}",
    "En analyse",
    null,
    "Ajouter une validation du destinataire"
  ];
  sheet.getRange("A7:M8").values = [headers, example];
  styleTable(sheet, "A7:M32", "A7:M7");
  sheet.getRange("B8:B32").format.numberFormat = "yyyy-mm-dd";
  sheet.getRange("L8:L32").format.numberFormat = "yyyy-mm-dd";
  sheet.getRange("G8:G32").dataValidation = {
    rule: { type: "list", values: ["À évaluer", "Oui", "Non"] }
  };
  sheet.getRange("K8:K32").dataValidation = {
    rule: {
      type: "list",
      values: ["Ouvert", "En analyse", "Actions en cours", "Clôturé"]
    }
  };
  [10, 13, 34, 27, 20, 31, 22, 32, 30, 18, 16, 13, 32].forEach(
    (width, index) => {
      sheet.getRangeByIndexes(0, index, 32, 1).format.columnWidth = width;
    }
  );
  sheet.freezePanes.freezeRows(7);
  await saveAndRender(workbook, "registre-incidents-loi25.xlsx", ["Incidents"]);
}

await buildAiRegister();
await buildCyberChecklist();
await buildLaw25Inventory();
await buildLaw25IncidentRegister();
console.log("Created four XLSX templates and rendered every sheet.");
