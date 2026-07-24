import { beforeEach, describe, expect, it } from "vitest";

import { db } from "@/lib/db";
import {
  buildMarketingEmail,
  createUnsubscribeToken,
  processDueEmailJobs,
  scheduleDiagnosticNurture,
  unsubscribeByToken,
  verifyUnsubscribeToken
} from "@/lib/email-automation";

describe("email automation", () => {
  beforeEach(async () => {
    await db.emailJob.deleteMany();
    await db.subscriber.deleteMany();
  });

  it("ne planifie aucune relance sans consentement explicite", async () => {
    const jobs = await scheduleDiagnosticNurture({
      email: "Sans.Consentement@Example.invalid",
      consentMarketing: false,
      source: "diagnostic-ai",
      contextId: "assessment-no-consent",
      diagnostic: "ai",
      resultUrl: "/intelligence-artificielle/rapport/token"
    });

    expect(jobs).toEqual([]);
    await expect(db.emailJob.count()).resolves.toBe(0);
    await expect(
      db.subscriber.findUnique({
        where: { email: "sans.consentement@example.invalid" }
      })
    ).resolves.toMatchObject({
      consentMarketing: false,
      consentedAt: null
    });
  });

  it("planifie J+1, J+4 et J+7 une seule fois", async () => {
    const now = new Date("2026-07-23T12:00:00.000Z");
    const input = {
      email: "Abonne@Example.invalid",
      consentMarketing: true,
      source: "diagnostic-ai",
      contextId: "assessment-consented",
      diagnostic: "ai",
      resultUrl: "/intelligence-artificielle/rapport/token"
    };

    await scheduleDiagnosticNurture(input, now);
    await scheduleDiagnosticNurture(input, now);

    const jobs = await db.emailJob.findMany({
      orderBy: { scheduledAt: "asc" }
    });
    expect(jobs).toHaveLength(3);
    expect(jobs.map((job) => job.kind)).toEqual([
      "diagnostic_day_1",
      "diagnostic_day_4",
      "diagnostic_day_7"
    ]);
    expect(jobs.map((job) => job.scheduledAt.toISOString())).toEqual([
      "2026-07-24T12:00:00.000Z",
      "2026-07-27T12:00:00.000Z",
      "2026-07-30T12:00:00.000Z"
    ]);
  });

  it("signe le lien et annule immédiatement les tâches futures", async () => {
    await scheduleDiagnosticNurture({
      email: "retrait@example.invalid",
      consentMarketing: true,
      source: "diagnostic-loi25",
      contextId: "assessment-unsubscribe",
      diagnostic: "loi25",
      resultUrl: "/loi-25/rapport/token"
    });
    const subscriber = await db.subscriber.findUniqueOrThrow({
      where: { email: "retrait@example.invalid" }
    });
    const token = createUnsubscribeToken(subscriber);

    expect(verifyUnsubscribeToken(token)).toEqual({
      subscriberId: subscriber.id,
      email: subscriber.email
    });
    expect(verifyUnsubscribeToken(`${token}x`)).toBeNull();
    await expect(unsubscribeByToken(token)).resolves.toMatchObject({
      email: subscriber.email
    });
    await expect(
      db.subscriber.findUnique({ where: { id: subscriber.id } })
    ).resolves.toMatchObject({
      consentMarketing: false
    });
    expect(
      await db.emailJob.count({
        where: { subscriberId: subscriber.id, status: "canceled" }
      })
    ).toBe(3);
  });

  it("revérifie le consentement juste avant l'envoi", async () => {
    const now = new Date("2026-07-23T12:00:00.000Z");
    await scheduleDiagnosticNurture(
      {
        email: "barriere@example.invalid",
        consentMarketing: true,
        source: "diagnostic-cybersecurity",
        contextId: "assessment-second-check",
        diagnostic: "cybersecurity",
        resultUrl: "/cybersecurite/rapport/token"
      },
      now
    );
    const subscriber = await db.subscriber.update({
      where: { email: "barriere@example.invalid" },
      data: { consentMarketing: false, unsubscribedAt: new Date() }
    });

    const result = await processDueEmailJobs({
      now: new Date("2026-08-01T12:00:00.000Z")
    });
    expect(result.sent).toBe(0);
    expect(result.cancelled).toBe(3);
    await expect(
      db.emailJob.count({
        where: { subscriberId: subscriber.id, status: "canceled" }
      })
    ).resolves.toBe(3);
  });

  it("ne marque pas un courriel comme envoyé lorsque le fournisseur est absent", async () => {
    const now = new Date("2026-07-23T12:00:00.000Z");
    await scheduleDiagnosticNurture(
      {
        email: "fournisseur-absent@example.invalid",
        consentMarketing: true,
        source: "diagnostic-ai",
        contextId: "assessment-provider-missing",
        diagnostic: "ai",
        resultUrl: "/intelligence-artificielle/rapport/token"
      },
      now
    );

    const result = await processDueEmailJobs({
      now: new Date("2026-07-25T12:00:00.000Z")
    });
    const firstJob = await db.emailJob.findUniqueOrThrow({
      where: {
        idempotencyKey: "assessment-provider-missing:diagnostic_day_1"
      }
    });

    expect(result).toMatchObject({ considered: 1, sent: 0, failed: 1 });
    expect(firstJob).toMatchObject({
      status: "scheduled",
      sentAt: null,
      attempts: 1
    });
    expect(firstJob.lastError).toContain("Envoi commercial non configuré");
  });

  it("identifie ForméducWeb et inclut un désabonnement dans l'offre", () => {
    const message = buildMarketingEmail(
      "diagnostic_day_7",
      {
        diagnostic: "IA",
        resultUrl: "/intelligence-artificielle/rapport/token"
      },
      { id: "subscriber-id", email: "abonne@example.invalid" }
    );

    expect(message.contentHtml).toContain("29 $ CAD");
    expect(message.contentHtml).toContain("59 $ CAD");
    expect(message.unsubscribeUrl).toContain("/desabonnement?token=");
  });
});
