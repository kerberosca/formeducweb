import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#f8fafc",
    color: "#17324d",
    fontFamily: "Helvetica",
    padding: 54
  },
  frame: {
    borderColor: "#2c6e6f",
    borderWidth: 2,
    minHeight: 470,
    padding: 48,
    textAlign: "center"
  },
  eyebrow: {
    color: "#2c6e6f",
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 36,
    textTransform: "uppercase"
  },
  title: {
    fontFamily: "Helvetica-Bold",
    fontSize: 30,
    marginBottom: 30
  },
  lead: {
    fontSize: 14,
    marginBottom: 18
  },
  recipient: {
    color: "#13293d",
    fontFamily: "Helvetica-Bold",
    fontSize: 23,
    marginBottom: 24
  },
  course: {
    color: "#2c6e6f",
    fontFamily: "Helvetica-Bold",
    fontSize: 19,
    lineHeight: 1.4,
    marginBottom: 32
  },
  detail: {
    fontSize: 11,
    lineHeight: 1.6,
    marginBottom: 8
  },
  footer: {
    borderTopColor: "#b7c9ca",
    borderTopWidth: 1,
    fontSize: 9,
    lineHeight: 1.5,
    marginTop: 44,
    paddingTop: 16
  }
});

export type CertificatePdfDocumentProps = {
  certificateId: string;
  recipient: string;
  courseTitle: string;
  issuedOn: string;
  issuedAt: Date;
  verificationUrl: string;
};

export function CertificatePdfDocument({
  certificateId,
  recipient,
  courseTitle,
  issuedOn,
  issuedAt,
  verificationUrl
}: CertificatePdfDocumentProps) {
  return (
    <Document
      author="Formeduc Web"
      creationDate={issuedAt}
      modificationDate={issuedAt}
      subject={`Attestation de réussite — ${courseTitle}`}
      title={`Certificat — ${recipient}`}
    >
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.frame}>
          <Text style={styles.eyebrow}>Formeduc Web</Text>
          <Text style={styles.title}>Certificat de réussite</Text>
          <Text style={styles.lead}>Ce certificat atteste que</Text>
          <Text style={styles.recipient}>{recipient}</Text>
          <Text style={styles.lead}>a complété avec succès la formation</Text>
          <Text style={styles.course}>{courseTitle}</Text>
          <Text style={styles.detail}>Délivré le {issuedOn}</Text>
          <Text style={styles.detail}>Certificat no {certificateId}</Text>
          <Text style={styles.footer}>Vérification : {verificationUrl}</Text>
        </View>
      </Page>
    </Document>
  );
}
