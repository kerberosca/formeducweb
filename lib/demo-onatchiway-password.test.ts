import { randomBytes } from "node:crypto";
import { describe, expect, it } from "vitest";

import {
  deriveDemoOnatchiwayPasswordHash,
  verifyDemoOnatchiwayPassword
} from "@/lib/demo-onatchiway-password";

describe("mot de passe privé Onatchiway", () => {
  it("accepte le mot de passe exact et refuse une autre valeur", async () => {
    const password = "mot-de-passe-de-test";
    const salt = randomBytes(24).toString("base64url");
    const hash = await deriveDemoOnatchiwayPasswordHash(password, salt);
    const credentials = { hash, salt };

    await expect(
      verifyDemoOnatchiwayPassword(password, credentials)
    ).resolves.toBe(true);
    await expect(
      verifyDemoOnatchiwayPassword("mauvaise-valeur", credentials)
    ).resolves.toBe(false);
  });
});
