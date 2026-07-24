from __future__ import annotations

from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "public" / "exemples"

BLUE = HexColor("#1571D4")
NAVY = HexColor("#16263B")
ORANGE = HexColor("#FD8417")
PALE_BLUE = HexColor("#EAF3FC")
PALE_ORANGE = HexColor("#FFF1E4")
GRAY = HexColor("#5F6B7A")
LIGHT = HexColor("#D9E2EC")

BASE = getSampleStyleSheet()
TITLE = ParagraphStyle(
    "KitTitle",
    parent=BASE["Title"],
    fontName="Helvetica-Bold",
    fontSize=24,
    leading=28,
    textColor=NAVY,
    alignment=TA_LEFT,
    spaceAfter=8,
)
SUBTITLE = ParagraphStyle(
    "KitSubtitle",
    parent=BASE["BodyText"],
    fontName="Helvetica",
    fontSize=11,
    leading=16,
    textColor=GRAY,
    spaceAfter=12,
)
H1 = ParagraphStyle(
    "KitH1",
    parent=BASE["Heading1"],
    fontName="Helvetica-Bold",
    fontSize=15,
    leading=18,
    textColor=BLUE,
    spaceBefore=10,
    spaceAfter=7,
)
H2 = ParagraphStyle(
    "KitH2",
    parent=BASE["Heading2"],
    fontName="Helvetica-Bold",
    fontSize=11,
    leading=14,
    textColor=NAVY,
    spaceBefore=6,
    spaceAfter=4,
)
BODY = ParagraphStyle(
    "KitBody",
    parent=BASE["BodyText"],
    fontName="Helvetica",
    fontSize=9.5,
    leading=14,
    textColor=NAVY,
    spaceAfter=6,
)
BULLET = ParagraphStyle(
    "KitBullet",
    parent=BODY,
    leftIndent=11,
    firstLineIndent=-7,
    bulletIndent=2,
    spaceAfter=4,
)
SMALL = ParagraphStyle(
    "KitSmall",
    parent=BODY,
    fontSize=8,
    leading=11,
    textColor=GRAY,
)


def header_footer(canvas, doc):
    canvas.saveState()
    width, height = A4
    canvas.setFillColor(NAVY)
    canvas.setFont("Helvetica-Bold", 8)
    canvas.drawString(17 * mm, height - 12 * mm, "FORMÉDUCWEB")
    canvas.setFillColor(ORANGE)
    canvas.drawRightString(width - 17 * mm, height - 12 * mm, "EXEMPLE FICTIF")
    canvas.setStrokeColor(LIGHT)
    canvas.line(17 * mm, height - 15 * mm, width - 17 * mm, height - 15 * mm)
    canvas.setFillColor(GRAY)
    canvas.setFont("Helvetica", 7.5)
    canvas.drawString(
        17 * mm,
        9 * mm,
        "Aperçu de 2 pages seulement · Les recommandations réelles dépendent des réponses.",
    )
    canvas.drawRightString(width - 17 * mm, 9 * mm, f"Page {doc.page}")
    canvas.restoreState()


def bullet(text: str) -> Paragraph:
    return Paragraph(f"• {text}", BULLET)


def callout(title: str, text: str, color=PALE_ORANGE):
    content = [
        Paragraph(title, H2),
        Paragraph(text, BODY),
    ]
    table = Table([[content]], colWidths=[170 * mm])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), color),
                ("BOX", (0, 0), (-1, -1), 0.6, LIGHT),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ("TOPPADDING", (0, 0), (-1, -1), 7),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
            ]
        )
    )
    return table


def score_table(sections):
    rows = [[Paragraph("Section", H2), Paragraph("Résultat fictif", H2)]]
    rows.extend(
        [
            [Paragraph(name, BODY), Paragraph(f"<b>{score} %</b>", BODY)]
            for name, score in sections
        ]
    )
    table = Table(rows, colWidths=[125 * mm, 45 * mm])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), BLUE),
                ("TEXTCOLOR", (0, 0), (-1, 0), white),
                ("GRID", (0, 0), (-1, -1), 0.5, LIGHT),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 7),
                ("RIGHTPADDING", (0, 0), (-1, -1), 7),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    return table


def build_sample(
    filename: str,
    label: str,
    title: str,
    score: int,
    sections,
    priorities,
    plan30,
    plan90,
    templates,
    disclaimer,
):
    OUTPUT.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(
        str(OUTPUT / filename),
        pagesize=A4,
        leftMargin=17 * mm,
        rightMargin=17 * mm,
        topMargin=21 * mm,
        bottomMargin=16 * mm,
        title=f"Exemple fictif — {title}",
        author="ForméducWeb",
        subject=f"Aperçu du Kit d’exécution 90 jours — {label}",
    )
    story = [
        Paragraph("KIT D’EXÉCUTION 90 JOURS", ParagraphStyle(
            "Kicker", parent=SMALL, textColor=ORANGE, fontName="Helvetica-Bold", spaceAfter=4
        )),
        Paragraph(title, TITLE),
        Paragraph(
            "Préparé pour <b>Atelier Boréal inc.</b> — entreprise entièrement fictive utilisée uniquement pour montrer le niveau de détail.",
            SUBTITLE,
        ),
        callout(
            f"Score fictif : {score}/100 · Priorité : agir avec méthode",
            "Cet aperçu ne constitue ni un audit certifié ni un avis juridique. Le document acheté est personnalisé avec le nom de l’entreprise et ses réponses.",
            PALE_BLUE,
        ),
        Paragraph("Lecture du diagnostic", H1),
        score_table(sections),
        Paragraph("Trois priorités illustratives", H1),
    ]
    for heading, detail in priorities:
        story.append(
            KeepTogether(
                [
                    Paragraph(heading, H2),
                    Paragraph(detail, BODY),
                ]
            )
        )
    story.extend(
        [
            Spacer(1, 4),
            Paragraph(disclaimer, SMALL),
            PageBreak(),
            Paragraph("Plan d’action et outils", TITLE),
            Paragraph(
                "Extrait de la feuille de route. Le kit complet relie chaque action à vos réponses et fournit des gabarits éditables.",
                SUBTITLE,
            ),
            Paragraph("Dans les 30 premiers jours", H1),
        ]
    )
    for item in plan30:
        story.append(bullet(item))
    story.append(Paragraph("Cap sur 90 jours", H1))
    for item in plan90:
        story.append(bullet(item))
    story.append(Paragraph("Gabarits compris", H1))
    rows = [[Paragraph("Fichier", H2), Paragraph("Utilité", H2)]]
    rows.extend(
        [[Paragraph(name, BODY), Paragraph(use, BODY)] for name, use in templates]
    )
    table = Table(rows, colWidths=[62 * mm, 108 * mm])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), NAVY),
                ("TEXTCOLOR", (0, 0), (-1, 0), white),
                ("GRID", (0, 0), (-1, -1), 0.5, LIGHT),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 7),
                ("RIGHTPADDING", (0, 0), (-1, -1), 7),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.extend(
        [
            table,
            Spacer(1, 8),
            callout(
                "Conditions du kit",
                "Accès pendant 730 jours. Crédit de 29 $ CAD valide 90 jours sur un accompagnement admissible. Remboursement demandé dans les 7 jours avec révocation de l’accès.",
            ),
        ]
    )
    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)


def main():
    build_sample(
        "kit-intelligence-artificielle-exemple.pdf",
        "IA",
        "Exemple · Diagnostic IA pour PME",
        58,
        [
            ("Gouvernance et règles", 42),
            ("Données et confidentialité", 55),
            ("Cas d’usage et valeur", 71),
            ("Validation humaine", 63),
        ],
        [
            (
                "Adopter une charte courte",
                "Définir les usages permis, les données interdites et la responsabilité de validation.",
            ),
            (
                "Créer un registre des usages",
                "Consigner les cas significatifs, l’outil, les données, la décision et la prochaine revue.",
            ),
            (
                "Tester un cas mesurable",
                "Choisir une tâche réversible et mesurer temps gagné, qualité et risques observés.",
            ),
        ],
        [
            "Nommer un responsable et inventorier les outils déjà utilisés.",
            "Adapter puis faire approuver la charte IA.",
            "Lancer un pilote sans données sensibles avec un critère de succès.",
        ],
        [
            "Revoir les entrées du registre et retirer les usages sans valeur.",
            "Former l’équipe avec le mémo et deux exemples internes.",
            "Documenter les validations requises pour les usages plus sensibles.",
        ],
        [
            ("Charte IA éditable · DOCX", "Adapter les règles et responsabilités."),
            ("Registre des usages · XLSX", "Suivre les essais, décisions et révisions."),
            ("Mémo équipe · DOCX", "Diffuser sept réflexes simples."),
        ],
        "Les règles applicables évoluent; faites valider les usages à risque selon votre secteur et vos obligations.",
    )
    build_sample(
        "kit-cybersecurite-exemple.pdf",
        "Cyber",
        "Exemple · Diagnostic cybersécurité PME",
        54,
        [
            ("Comptes et accès", 48),
            ("Sauvegardes et reprise", 51),
            ("Appareils et correctifs", 65),
            ("Réflexes d’incident", 50),
        ],
        [
            (
                "Tester la restauration",
                "Vérifier réellement qu’un fichier essentiel peut être restauré dans un délai acceptable.",
            ),
            (
                "Réviser les accès critiques",
                "Confirmer les administrateurs, activer MFA et documenter le retrait des accès.",
            ),
            (
                "Répéter le signalement",
                "Faire un exercice court pour que chaque personne sache quoi signaler et par quel canal.",
            ),
        ],
        [
            "Lister les comptes, systèmes et données essentiels.",
            "Confirmer la portée des sauvegardes et réaliser un test.",
            "Adapter la procédure d’incident et désigner le canal de signalement.",
        ],
        [
            "Revoir les comptes privilégiés et les départs récents.",
            "Corriger les écarts de sauvegarde et refaire un test.",
            "Tenir une simulation antifraude avec la règle des deux canaux.",
        ],
        [
            ("Procédure d’incident · DOCX", "Coordonner la première heure et la reprise."),
            ("Checklist accès/sauvegardes · XLSX", "Attribuer, prouver et réviser les contrôles."),
            ("Mémo antifraude · DOCX", "Aider l’équipe à ralentir et vérifier."),
        ],
        "Ce diagnostic ne remplace pas un audit technique, un test d’intrusion ni l’intervention d’un spécialiste lors d’un incident.",
    )
    build_sample(
        "kit-loi-25-exemple.pdf",
        "Loi 25",
        "Exemple · Diagnostic Loi 25 pour PME",
        56,
        [
            ("Inventaire et finalités", 43),
            ("Transparence et formulaires", 68),
            ("Accès et fournisseurs", 54),
            ("Incidents et demandes", 59),
        ],
        [
            (
                "Compléter l’inventaire",
                "Relier chaque catégorie de renseignements à une finalité, un système, des accès et une règle de conservation.",
            ),
            (
                "Formaliser les demandes",
                "Centraliser la réception, la vérification d’identité, la recherche et la réponse.",
            ),
            (
                "Tenir un registre d’incidents",
                "Documenter les faits, l’évaluation du risque, les décisions et les actions préventives.",
            ),
        ],
        [
            "Recenser les principaux formulaires, systèmes et fournisseurs.",
            "Adapter la procédure de demandes et confirmer le canal officiel.",
            "Ouvrir les registres d’inventaire et d’incidents avec les responsables.",
        ],
        [
            "Valider les finalités, accès et règles de conservation prioritaires.",
            "Faire un exercice fictif de demande d’accès ou de rectification.",
            "Revoir les formulaires et la politique avec les constats de l’inventaire.",
        ],
        [
            ("Inventaire des données · XLSX", "Cartographier collecte, usage, accès et conservation."),
            ("Registre d’incidents · XLSX", "Tracer les évaluations et mesures prises."),
            ("Procédure + textes · DOCX", "Traiter les demandes et adapter les formulaires."),
        ],
        "Ce document aide à structurer le travail. Il ne constitue pas un avis juridique ni une attestation de conformité.",
    )
    print(f"Created 3 two-page sample PDFs in {OUTPUT}")


if __name__ == "__main__":
    main()
