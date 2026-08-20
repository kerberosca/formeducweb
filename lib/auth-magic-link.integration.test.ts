import { createHash } from "node:crypto";

import { NextRequest } from "next/server";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi
} from "vitest";

import { MAGIC_LINK_MAX_AGE_SECONDS } from "@/lib/auth-config";
import { db } from "@/lib/db";

const AUTH_SECRET = "formeducweb-auth-integration-secret";
const EMAIL = "magic-link-integration@example.ca";

let handlers: (typeof import("@/auth"))["handlers"];

function hashedToken(token: string) {
  return createHash("sha256").update(`${token}${AUTH_SECRET}`).digest("hex");
}

function callbackRequest(token: string) {
  const query = new URLSearchParams({
    callbackUrl: "http://localhost:3000/mon-espace",
    token,
    email: EMAIL
  });
  return new NextRequest(
    `http://localhost:3000/api/auth/callback/email?${query}`
  );
}

async function clearFixture() {
  await db.verificationToken.deleteMany({ where: { identifier: EMAIL } });
  const user = await db.user.findUnique({ where: { email: EMAIL } });
  if (!user) return;
  await db.session.deleteMany({ where: { userId: user.id } });
  await db.account.deleteMany({ where: { userId: user.id } });
  await db.user.delete({ where: { id: user.id } });
}

describe("lien magique Auth.js", () => {
  beforeAll(async () => {
    process.env.AUTH_SECRET = AUTH_SECRET;
    process.env.AUTH_URL = "http://localhost:3000";
    process.env.LMS_BOOTSTRAP_ADMIN_EMAILS = "";
    ({ handlers } = await import("@/auth"));
  });

  beforeEach(async () => {
    await clearFixture();
  });

  afterAll(async () => {
    await clearFixture();
  });

  it("crée une session une seule fois puis refuse la réutilisation", async () => {
    const token = "single-use-token";
    await db.verificationToken.create({
      data: {
        identifier: EMAIL,
        token: hashedToken(token),
        expires: new Date(Date.now() + MAGIC_LINK_MAX_AGE_SECONDS * 1_000)
      }
    });

    const firstResponse = await handlers.GET(callbackRequest(token));

    expect(firstResponse.status).toBe(302);
    expect(firstResponse.headers.get("location")).toBe(
      "http://localhost:3000/mon-espace"
    );
    expect(
      await db.verificationToken.count({ where: { identifier: EMAIL } })
    ).toBe(0);
    expect(await db.session.count({ where: { user: { email: EMAIL } } })).toBe(
      1
    );

    const authError = vi.spyOn(console, "error").mockImplementation(() => {});
    const reusedResponse = await handlers.GET(callbackRequest(token));
    authError.mockRestore();

    expect(reusedResponse.status).toBe(302);
    expect(reusedResponse.headers.get("location")).toBe(
      "http://localhost:3000/connexion?error=Verification"
    );
    expect(await db.session.count({ where: { user: { email: EMAIL } } })).toBe(
      1
    );
  });

  it("refuse un lien expiré sans créer de compte ni de session", async () => {
    const token = "expired-token";
    await db.verificationToken.create({
      data: {
        identifier: EMAIL,
        token: hashedToken(token),
        expires: new Date(Date.now() - 1_000)
      }
    });

    const authError = vi.spyOn(console, "error").mockImplementation(() => {});
    const response = await handlers.GET(callbackRequest(token));
    authError.mockRestore();

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/connexion?error=Verification"
    );
    expect(await db.user.count({ where: { email: EMAIL } })).toBe(0);
    expect(
      await db.verificationToken.count({ where: { identifier: EMAIL } })
    ).toBe(0);
  });

  it("attribue encore le rôle administrateur à la création d’un compte amorcé", async () => {
    const token = "new-bootstrap-admin-token";
    process.env.LMS_BOOTSTRAP_ADMIN_EMAILS = EMAIL;

    try {
      await db.verificationToken.create({
        data: {
          identifier: EMAIL,
          token: hashedToken(token),
          expires: new Date(Date.now() + MAGIC_LINK_MAX_AGE_SECONDS * 1_000)
        }
      });

      const response = await handlers.GET(callbackRequest(token));

      expect(response.status).toBe(302);
      await expect(
        db.user.findUnique({ where: { email: EMAIL } })
      ).resolves.toMatchObject({ role: "admin", isActive: true });
    } finally {
      process.env.LMS_BOOTSTRAP_ADMIN_EMAILS = "";
    }
  });

  it("conserve la rétrogradation d’un administrateur amorcé lors des connexions suivantes", async () => {
    const token = "demoted-bootstrap-admin-token";
    process.env.LMS_BOOTSTRAP_ADMIN_EMAILS = EMAIL;

    try {
      await db.user.create({
        data: {
          email: EMAIL,
          emailVerified: new Date(),
          role: "learner",
          isActive: true
        }
      });
      await db.verificationToken.create({
        data: {
          identifier: EMAIL,
          token: hashedToken(token),
          expires: new Date(Date.now() + MAGIC_LINK_MAX_AGE_SECONDS * 1_000)
        }
      });

      const response = await handlers.GET(callbackRequest(token));

      expect(response.status).toBe(302);
      await expect(
        db.user.findUnique({ where: { email: EMAIL } })
      ).resolves.toMatchObject({ role: "learner", isActive: true });
    } finally {
      process.env.LMS_BOOTSTRAP_ADMIN_EMAILS = "";
    }
  });

  it("fixe la durée de validité à quinze minutes", () => {
    expect(MAGIC_LINK_MAX_AGE_SECONDS).toBe(15 * 60);
  });
});
