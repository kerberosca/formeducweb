import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  createContactRequestRecord,
  sendContactEmail,
  recordSubscriberConsent
} = vi.hoisted(() => ({
  createContactRequestRecord: vi.fn(),
  sendContactEmail: vi.fn(),
  recordSubscriberConsent: vi.fn()
}));

vi.mock("@/lib/contact-request-store", () => ({
  createContactRequestRecord
}));
vi.mock("@/lib/email", () => ({ sendContactEmail }));
vi.mock("@/lib/email-automation", () => ({ recordSubscriberConsent }));
vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: () => ({ allowed: true, retryAfterSeconds: 0 })
}));

import { POST } from "@/app/api/contact/route";

const validPayload = {
  name: "Marie Tremblay",
  company: "",
  email: "marie@example.com",
  phone: "",
  reason: "Boutique en ligne",
  message: "Je souhaite discuter de ma future boutique en ligne.",
  website: "",
  consentMarketing: false
};

function createRequest(payload: Record<string, unknown>) {
  return new Request("https://formeducweb.ca/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}

describe("POST /api/contact", () => {
  beforeEach(() => {
    createContactRequestRecord.mockResolvedValue({ id: "contact-1" });
    sendContactEmail.mockResolvedValue({ id: "email-1" });
    recordSubscriberConsent.mockResolvedValue(undefined);
  });

  it("accepte une entreprise vide et traite une demande légitime", async () => {
    const response = await POST(createRequest(validPayload));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      message: "Votre demande a été reçue."
    });
    expect(createContactRequestRecord).toHaveBeenCalledOnce();
    expect(recordSubscriberConsent).toHaveBeenCalledOnce();
    expect(sendContactEmail).toHaveBeenCalledOnce();
  });

  it("confirme neutralement le leurre sans écrire ni envoyer", async () => {
    const response = await POST(
      createRequest({ ...validPayload, website: "https://robot.example" })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      message: "Votre demande a été reçue."
    });
    expect(createContactRequestRecord).not.toHaveBeenCalled();
    expect(recordSubscriberConsent).not.toHaveBeenCalled();
    expect(sendContactEmail).not.toHaveBeenCalled();
  });

  it("refuse un motif qui ne fait pas partie de la liste partagée", async () => {
    const response = await POST(
      createRequest({ ...validPayload, reason: "Motif inventé" })
    );

    expect(response.status).toBe(400);
    expect(createContactRequestRecord).not.toHaveBeenCalled();
  });
});
