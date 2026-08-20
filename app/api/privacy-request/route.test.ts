import { beforeEach, describe, expect, it, vi } from "vitest";

const sendPrivacyRequestEmail = vi.hoisted(() => vi.fn());

vi.mock("@/lib/email", () => ({ sendPrivacyRequestEmail }));
vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: () => ({ allowed: true, retryAfterSeconds: 0 })
}));

import { POST } from "@/app/api/privacy-request/route";

const validPayload = {
  fullName: "Marie Tremblay",
  email: "marie@example.ca",
  companyName: "PME Exemple",
  requestType: "access",
  message: "Je souhaite obtenir une copie de mes renseignements personnels.",
  website: ""
};

function request(payload: unknown, headers: Record<string, string> = {}) {
  return new Request("https://formeducweb.ca/api/privacy-request", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(payload)
  });
}

describe("POST /api/privacy-request", () => {
  beforeEach(() => {
    sendPrivacyRequestEmail.mockResolvedValue({ id: "email-1" });
  });

  it("traite une demande légitime", async () => {
    const response = await POST(request(validPayload));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(sendPrivacyRequestEmail).toHaveBeenCalledOnce();
  });

  it("confirme neutralement le leurre sans envoyer de courriel", async () => {
    const response = await POST(
      request({ ...validPayload, website: "https://robot.example" })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(sendPrivacyRequestEmail).not.toHaveBeenCalled();
  });

  it("refuse le corps annoncé trop volumineux avant de le décoder", async () => {
    const response = await POST(
      request(validPayload, { "Content-Length": String(64 * 1024) })
    );

    expect(response.status).toBe(413);
    expect(sendPrivacyRequestEmail).not.toHaveBeenCalled();
  });

  it("refuse aussi un corps réel trop volumineux sans Content-Length", async () => {
    const response = await POST(
      request({ ...validPayload, message: "x".repeat(64 * 1024) })
    );

    expect(response.status).toBe(413);
    expect(sendPrivacyRequestEmail).not.toHaveBeenCalled();
  });
});
