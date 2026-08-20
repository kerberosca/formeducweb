import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  authPost: vi.fn(),
  consumeMagicLinkRateLimit: vi.fn()
}));

vi.mock("@/auth", () => ({
  handlers: {
    GET: vi.fn(),
    POST: mocks.authPost
  }
}));

vi.mock("@/lib/auth-rate-limit", () => ({
  consumeMagicLinkRateLimit: mocks.consumeMagicLinkRateLimit
}));

import { POST } from "@/app/api/auth/[...nextauth]/route";

const MAGIC_LINK_REQUEST_MAX_BODY_BYTES = 16 * 1024;

function magicLinkRequest(email = "Learner@Example.ca") {
  return new NextRequest("http://localhost/api/auth/signin/email", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      "x-auth-return-redirect": "1",
      "x-forwarded-for": "203.0.113.20"
    },
    body: new URLSearchParams({
      email,
      csrfToken: "test"
    })
  });
}

function rawMagicLinkRequest(body: string, headers?: Record<string, string>) {
  return new NextRequest("http://localhost/api/auth/signin/email", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      "x-auth-return-redirect": "1",
      ...headers
    },
    body
  });
}

describe("magic-link route rate limiting", () => {
  beforeEach(() => {
    mocks.authPost.mockReset();
    mocks.consumeMagicLinkRateLimit.mockReset();
  });

  it("retourne la confirmation générique sans créer de jeton si la limite est atteinte", async () => {
    mocks.consumeMagicLinkRateLimit.mockResolvedValue(false);

    const response = await POST(magicLinkRequest());

    expect(mocks.authPost).not.toHaveBeenCalled();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      url: "http://localhost/api/auth/verify-request?provider=email&type=email"
    });
  });

  it.each([
    "victime@example.ca,attaquant@example.ca",
    "victime@example.ca\r\nBcc: attaquant@example.ca",
    '"victime@example.ca"@example.ca',
    `${"a".repeat(244)}@example.ca`
  ])(
    "retourne la confirmation générique sans jeton pour l'identifiant invalide %s",
    async (email) => {
      const response = await POST(magicLinkRequest(email));

      expect(mocks.consumeMagicLinkRateLimit).not.toHaveBeenCalled();
      expect(mocks.authPost).not.toHaveBeenCalled();
      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toEqual({
        url: "http://localhost/api/auth/verify-request?provider=email&type=email"
      });
    }
  );

  it("transmet une demande permise à Auth.js avec le marqueur interne", async () => {
    mocks.consumeMagicLinkRateLimit.mockResolvedValue(true);
    mocks.authPost.mockImplementation(async (request: NextRequest) => {
      const formData = await request.formData();
      return Response.json({
        checked: request.headers.get("x-formeduc-auth-rate-limit-checked"),
        email: formData.get("email")
      });
    });

    const response = await POST(magicLinkRequest());

    expect(mocks.consumeMagicLinkRateLimit).toHaveBeenCalledWith({
      email: "learner@example.ca",
      ip: "unknown"
    });
    await expect(response.json()).resolves.toEqual({
      checked: "1",
      email: "Learner@Example.ca"
    });
  });

  it("rejette génériquement un Content-Length excessif avant le parsing", async () => {
    mocks.consumeMagicLinkRateLimit.mockResolvedValue(true);
    const response = await POST(
      rawMagicLinkRequest("email=learner%40example.ca", {
        "content-length": String(MAGIC_LINK_REQUEST_MAX_BODY_BYTES + 1)
      })
    );

    expect(mocks.consumeMagicLinkRateLimit).not.toHaveBeenCalled();
    expect(mocks.authPost).not.toHaveBeenCalled();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      url: "http://localhost/api/auth/verify-request?provider=email&type=email"
    });
  });

  it("borne aussi le flux réel lorsque Content-Length est absent", async () => {
    mocks.consumeMagicLinkRateLimit.mockResolvedValue(true);
    const body = new URLSearchParams({
      email: "learner@example.ca",
      padding: "a".repeat(MAGIC_LINK_REQUEST_MAX_BODY_BYTES)
    }).toString();
    const response = await POST(rawMagicLinkRequest(body));

    expect(mocks.consumeMagicLinkRateLimit).not.toHaveBeenCalled();
    expect(mocks.authPost).not.toHaveBeenCalled();
    expect(response.status).toBe(200);
  });
});
