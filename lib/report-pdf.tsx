import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import type { GeneratedReport } from "@/lib/recommendations";
import type { ScoreResult } from "@/lib/scoring";
import type { LeadCaptureInput } from "@/lib/schemas";
import type { WizardDataset } from "@/lib/wizard";
import { getReportUnlockPriceLabel } from "@/lib/payments";

export type AssessmentReportPdfPayload = {
  wizard: WizardDataset;
  leadCapture: LeadCaptureInput;
  scoreResult: ScoreResult;
  report: GeneratedReport;
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 28,
    paddingHorizontal: 32,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: "#12382f",
    lineHeight: 1.45
  },
  header: {
    marginBottom: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#d8e1dc"
  },
  eyebrow: {
    marginBottom: 8,
    fontSize: 10,
    color: "#2e6b5d",
    textTransform: "uppercase",
    letterSpacing: 1.6
  },
  title: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    marginBottom: 10
  },
  metaRow: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap"
  },
  metaText: {
    fontSize: 10,
    color: "#556863"
  },
  heroCard: {
    marginBottom: 18,
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d8e1dc",
    backgroundColor: "#f8fbf9"
  },
  heroScoreBlock: {
    marginTop: 2,
    marginBottom: 12
  },
  badge: {
    alignSelf: "flex-start",
    marginBottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#dff0ea",
    color: "#185344",
    fontSize: 10
  },
  scoreLabel: {
    fontSize: 10,
    color: "#556863",
    textTransform: "uppercase",
    letterSpacing: 1.2
  },
  scoreValue: {
    marginTop: 4,
    fontSize: 34,
    lineHeight: 1.1,
    fontFamily: "Helvetica-Bold",
    color: "#185344"
  },
  bodyText: {
    color: "#374b45",
    lineHeight: 1.4
  },
  heroTagline: {
    fontSize: 13,
    lineHeight: 1.35,
    color: "#374b45"
  },
  paragraphBlock: {
    marginTop: 10
  },
  section: {
    marginBottom: 16
  },
  sectionTitle: {
    marginBottom: 8,
    fontSize: 15,
    fontFamily: "Helvetica-Bold",
    color: "#12382f"
  },
  twoCol: {
    flexDirection: "row",
    gap: 10
  },
  col: {
    flex: 1
  },
  card: {
    marginBottom: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d8e1dc",
    backgroundColor: "#ffffff"
  },
  cardTitle: {
    marginBottom: 6,
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#12382f"
  },
  cardSubtle: {
    fontSize: 10,
    color: "#60746d"
  },
  list: {
    gap: 6
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6
  },
  bullet: {
    width: 12,
    fontFamily: "Helvetica-Bold"
  },
  listText: {
    flex: 1,
    color: "#374b45"
  },
  sectionScoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eef3f0"
  },
  sectionScoreName: {
    flex: 1,
    fontSize: 11,
    color: "#12382f"
  },
  sectionScoreValue: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#185344"
  },
  gapCard: {
    marginBottom: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d8e1dc",
    backgroundColor: "#fbfcfb"
  },
  priority: {
    marginTop: 6,
    fontSize: 10,
    color: "#60746d"
  },
  topGapsContextCard: {
    marginTop: 4,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d8e1dc",
    backgroundColor: "#f4faf7"
  },
  anchorItem: {
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eef3f0"
  },
  anchorQuestion: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#12382f"
  },
  anchorSection: {
    marginTop: 2,
    marginBottom: 4,
    fontSize: 9,
    color: "#60746d"
  },
  footer: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#d8e1dc",
    fontSize: 9,
    color: "#60746d"
  }
});

export function AssessmentReportPdfDocument({
  wizard,
  leadCapture,
  scoreResult,
  report
}: AssessmentReportPdfPayload) {
  const diagnosticAnchors = report.diagnosticAnchors ?? [];

  return (
    <Document
      title={`Rapport Loi 25 - ${leadCapture.companyName}`}
      author="ForméducWeb"
      subject="Rapport d’auto-évaluation Loi 25"
      language="fr-CA"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Rapport d’auto-évaluation Loi 25</Text>
          <Text style={styles.title}>Votre diagnostic Loi 25</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>Entreprise: {leadCapture.companyName}</Text>
            <Text style={styles.metaText}>Contact: {leadCapture.contactName}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>Courriel: {leadCapture.email}</Text>
            <Text style={styles.metaText}>Généré le: {new Date().toLocaleDateString("fr-CA")}</Text>
          </View>
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.badge}>{scoreResult.level.label}</Text>
          <View style={styles.heroScoreBlock}>
            <Text style={styles.scoreLabel}>Score global</Text>
            <Text style={styles.scoreValue}>{scoreResult.overallScore}/100</Text>
          </View>
          <Text style={styles.heroTagline}>{scoreResult.level.tagline}</Text>
          <View style={styles.paragraphBlock}>
            <Text style={styles.bodyText}>{wizard.disclaimer}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lecture rapide</Text>
          <View style={styles.twoCol}>
            <View style={styles.col}>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Points forts</Text>
                <View style={styles.list}>
                  {report.summary.highlights.map((item) => (
                    <View key={item} style={styles.listItem}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={styles.listText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.col}>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>À surveiller</Text>
                <View style={styles.list}>
                  {report.summary.cautions.map((item) => (
                    <View key={item} style={styles.listItem}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={styles.listText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>Scores par section</Text>
          <View style={styles.card}>
            {scoreResult.sectionScores.map((section) => (
              <View key={section.sectionId} style={styles.sectionScoreRow}>
                <Text style={styles.sectionScoreName}>{section.sectionTitle}</Text>
                <Text style={styles.sectionScoreValue}>{section.percent}%</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Écarts prioritaires</Text>
          {report.topGaps.map((gap) => (
            <View key={`${gap.section}-${gap.title}`} style={styles.gapCard} wrap={false}>
              <Text style={styles.cardTitle}>{gap.title}</Text>
              <Text style={styles.cardSubtle}>{gap.section}</Text>
              <Text style={[styles.bodyText, { marginTop: 6 }]}>{gap.whyItMatters}</Text>
              <Text style={[styles.bodyText, { marginTop: 8 }]}>{gap.action}</Text>
              <Text style={styles.priority}>Priorité: {gap.priority}</Text>
            </View>
          ))}
          {report.topGapsContext ? (
            <View style={styles.topGapsContextCard}>
              <Text style={styles.bodyText}>{report.topGapsContext}</Text>
            </View>
          ) : null}
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        {diagnosticAnchors.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lien avec votre questionnaire</Text>
            <View style={styles.card}>
              {diagnosticAnchors.map((anchor) => (
                <View key={`${anchor.questionId}-${anchor.action}`} style={styles.anchorItem}>
                  <Text style={styles.anchorQuestion}>{anchor.questionLabel}</Text>
                  <Text style={styles.anchorSection}>{anchor.section}</Text>
                  <Text style={styles.bodyText}>{anchor.action}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Plan 30 jours</Text>
          <View style={styles.card}>
            <View style={styles.list}>
              {report.plan30Days.map((item, index) => (
                <View key={item} style={styles.listItem}>
                  <Text style={styles.bullet}>{index + 1}.</Text>
                  <Text style={styles.listText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Plan 90 jours</Text>
          <View style={styles.card}>
            <View style={styles.list}>
              {report.plan90Days.map((item, index) => (
                <View key={item} style={styles.listItem}>
                  <Text style={styles.bullet}>{index + 1}.</Text>
                  <Text style={styles.listText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {scoreResult.notes.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.card}>
              <View style={styles.list}>
                {scoreResult.notes.map((item) => (
                  <View key={item} style={styles.listItem}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.listText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Disclaimers</Text>
          <View style={styles.card}>
            <View style={styles.list}>
              {report.disclaimers.map((item) => (
                <View key={item} style={styles.listItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.listText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <Text style={styles.footer}>
          Rapport préparé par ForméducWeb. Ce document vise le diagnostic, l’alignement et la priorisation d’actions.
          Il ne constitue pas un avis juridique. Crédit de {getReportUnlockPriceLabel()} applicable sur un forfait
          d’implantation si vous poursuivez avec nous.
        </Text>
      </Page>
    </Document>
  );
}
