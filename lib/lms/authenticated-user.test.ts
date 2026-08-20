import { afterEach, describe, expect, it, vi } from "vitest";

const { authMock } = vi.hoisted(() => ({ authMock: vi.fn() }));

vi.mock("@/auth", () => ({ auth: authMock }));

import { db } from "@/lib/db";
import { getAuthenticatedLmsUser } from "@/lib/lms/authenticated-user";

const emailPrefix = `lms-auth-${crypto.randomUUID()}`;

afterEach(async () => {
  authMock.mockReset();
  await db.user.deleteMany({ where: { email: { startsWith: emailPrefix } } });
});

describe("utilisateur LMS authentifié", () => {
  it("exige une session", async () => {
    authMock.mockResolvedValue(null);
    await expect(getAuthenticatedLmsUser()).rejects.toMatchObject({
      status: 401,
      code: "authentication_required"
    });
  });

  it("relit l’utilisateur en base et refuse un compte devenu inactif", async () => {
    const user = await db.user.create({
      data: {
        email: `${emailPrefix}-active@example.invalid`,
        emailVerified: new Date(),
        isActive: true
      }
    });
    authMock.mockResolvedValue({ user: { id: user.id, email: user.email } });

    await expect(getAuthenticatedLmsUser()).resolves.toMatchObject({
      id: user.id
    });
    await db.user.update({ where: { id: user.id }, data: { isActive: false } });
    await expect(getAuthenticatedLmsUser()).rejects.toMatchObject({
      status: 403,
      code: "inactive_account"
    });
  });

  it("refuse une adresse qui n’est pas vérifiée", async () => {
    const user = await db.user.create({
      data: {
        email: `${emailPrefix}-unverified@example.invalid`,
        emailVerified: null,
        isActive: true
      }
    });
    authMock.mockResolvedValue({ user: { id: user.id, email: user.email } });

    await expect(getAuthenticatedLmsUser()).rejects.toMatchObject({
      status: 403,
      code: "email_not_verified"
    });
  });
});
