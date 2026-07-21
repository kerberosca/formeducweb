import { beforeEach, describe, expect, it, vi } from "vitest";

import { normalizeStoredResult } from "@/components/wizard/assessment-wizard";
import {
  getWizardStorageKey,
  loadWizardDraft,
  loadWizardPersistedResult,
  saveWizardDraft
} from "@/lib/wizard";

describe("wizard local persistence", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.useRealTimers();
  });

  it("recharge un brouillon local", () => {
    saveWizardDraft(
      {
        answers: { A1: "pme" },
        contactName: "",
        companyName: "",
        email: "",
        phone: "",
        consentMarketing: false
      },
      "loi25"
    );

    expect(loadWizardDraft("loi25")?.answers.A1).toBe("pme");
  });

  it("supprime une sauvegarde locale expirée après 30 jours", () => {
    const key = getWizardStorageKey("loi25", "draft");
    window.localStorage.setItem(
      key,
      JSON.stringify({
        savedAt: "2024-01-01T00:00:00.000Z",
        data: { answers: { A1: "pme" } }
      })
    );

    expect(loadWizardDraft("loi25")).toBeNull();
    expect(window.localStorage.getItem(key)).toBeNull();
  });

  it("conserve la compatibilité avec un ancien résultat sans enveloppe ni état typé", () => {
    const legacy = {
      assessmentType: "loi25",
      assessmentId: "legacy-id",
      accessToken: "a".repeat(48),
      paymentStatus: "unpaid",
      leadCapture: {
        contactName: "",
        companyName: "",
        email: "client@example.com",
        phone: "",
        consentMarketing: false
      },
      answers: { A1: "pme" },
      scoreResult: {},
      liteReport: {}
    };
    window.localStorage.setItem(
      getWizardStorageKey("loi25", "result"),
      JSON.stringify(legacy)
    );

    const restored = normalizeStoredResult(loadWizardPersistedResult("loi25"));
    expect(restored?.kind).toBe("saved");
    expect(
      JSON.parse(
        window.localStorage.getItem(getWizardStorageKey("loi25", "result")) ??
          "{}"
      )
    ).toHaveProperty("savedAt");
  });
});
