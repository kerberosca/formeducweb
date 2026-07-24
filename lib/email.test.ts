import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  sendAssessmentReceivedEmails,
  sendReportUnlockedEmails
} from "@/lib/email";

const mocks = vi.hoisted(() => ({
  send: vi.fn()
}));

vi.mock("resend", () => ({
  Resend: class {
    emails = {
      send: mocks.send
    };
  }
}));

describe("sendAssessmentReceivedEmails", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.DISABLE_EXTERNAL_SERVICES = "0";
    process.env.RESEND_API_KEY = "test-key";
    process.env.RESEND_FROM = "ForméducWeb <test@formeducweb.ca>";
    process.env.EMAIL_PUBLIC_BASE_URL = "https://formeducweb.ca";
    mocks.send.mockResolvedValue({ data: { id: "email-1" }, error: null });
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("garde le courriel de résultat strictement transactionnel sans consentement", async () => {
    await sendAssessmentReceivedEmails({
      assessmentId: "assessment-123",
      accessToken: "secure-access-token",
      assessmentType: "ai",
      leadCapture: {
        contactName: "Alex",
        companyName: "Entreprise Exemple",
        email: "alex@example.invalid",
        phone: "",
        consentMarketing: false
      },
      scoreResult: {
        overallScore: 64,
        level: {
          label: "En progression",
          tagline: "Quelques actions sont prioritaires."
        },
        sectionScores: [],
        gaps: [],
        answeredCount: 10,
        applicableCount: 10,
        notes: []
      },
      liteReport: {
        summary: {
          score: 64,
          levelLabel: "En progression",
          levelTagline: "Quelques actions sont prioritaires.",
          highlights: [],
          cautions: []
        },
        topGaps: [
          {
            title: "Encadrer les usages IA",
            whyItMatters: "Réduire les risques.",
            action: "Documenter les usages permis.",
            section: "Gouvernance",
            priority: "Élevée"
          }
        ],
        prioritiesContext: "Commencez par cette action.",
        plan30Days: [],
        plan90DaysTeaser: "ARGUMENTAIRE_90_JOURS_INTERDIT",
        disclaimers: ["Résultat indicatif."],
        upsellTeaser: "ARGUMENTAIRE_COMMERCIAL_INTERDIT"
      }
    });

    const customerMessage = mocks.send.mock.calls
      .map(([message]) => message as { to: string; html: string })
      .find((message) => message.to === "alex@example.invalid");

    expect(customerMessage?.html).toContain("Score global");
    expect(customerMessage?.html).toContain("Encadrer les usages IA");
    expect(customerMessage?.html).toContain(
      "https://formeducweb.ca/intelligence-artificielle/rapport/secure-access-token"
    );
    expect(customerMessage?.html).not.toContain(
      "ARGUMENTAIRE_COMMERCIAL_INTERDIT"
    );
    expect(customerMessage?.html).not.toContain(
      "ARGUMENTAIRE_90_JOURS_INTERDIT"
    );
    expect(customerMessage?.html).not.toContain("Demander un appel");
    expect(customerMessage?.html).not.toContain("Écrire à ForméducWeb");
    expect(customerMessage?.html).not.toContain("/contact?");
  });

  it("garde aussi la confirmation d'achat transactionnelle sans consentement", async () => {
    await sendReportUnlockedEmails({
      assessment: {
        email: "acheteur@example.invalid",
        contactName: "Alex",
        companyName: "Entreprise Exemple",
        consentMarketing: false
      } as Parameters<typeof sendReportUnlockedEmails>[0]["assessment"],
      assessmentType: "ai",
      fullReport: {
        disclaimers: ["Résultat indicatif."]
      } as Parameters<typeof sendReportUnlockedEmails>[0]["fullReport"],
      reportUrl: "/intelligence-artificielle/rapport/token-payant",
      productCode: "ai_kit"
    });

    const messages = mocks.send.mock.calls.map(
      ([message]) => message as { to: string; html: string }
    );
    const customerMessage = messages.find(
      (message) => message.to === "acheteur@example.invalid"
    );
    const adminMessage = messages.find(
      (message) => message.to !== "acheteur@example.invalid"
    );

    expect(customerMessage?.html).toContain("Kit d’exécution 90 jours");
    expect(customerMessage?.html).not.toContain("Demander un appel");
    expect(customerMessage?.html).not.toContain("/contact?");
    expect(adminMessage?.html).toContain(
      "aucun suivi commercial sans nouveau consentement explicite"
    );
  });
});
