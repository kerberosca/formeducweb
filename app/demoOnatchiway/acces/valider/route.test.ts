import { randomBytes } from "node:crypto";
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { deriveDemoOnatchiwayPasswordHash } from "@/lib/demo-onatchiway-password";

import { POST } from "./route";

describe("validation de l’accès privé Onatchiway", () => {
  const password = "mot-de-passe-de-test";

  beforeEach(async () => {
    const salt = randomBytes(24).toString("base64url");

    process.env.DEMO_ONATCHIWAY_PASSWORD_SALT = salt;
    process.env.DEMO_ONATCHIWAY_PASSWORD_HASH =
      await deriveDemoOnatchiwayPasswordHash(password, salt);
    process.env.DEMO_ONATCHIWAY_SESSION_SECRET =
      "test-session-secret-that-is-long-enough";
  });

  afterEach(() => {
    delete process.env.DEMO_ONATCHIWAY_PASSWORD_SALT;
    delete process.env.DEMO_ONATCHIWAY_PASSWORD_HASH;
    delete process.env.DEMO_ONATCHIWAY_SESSION_SECRET;
  });

  it("redirige vers un chemin relatif même derrière le serveur mandataire", async () => {
    const request = new NextRequest(
      "https://0.0.0.0:3000/demoOnatchiway/acces/valider",
      {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ password })
      }
    );

    const response = await POST(request);

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/demoOnatchiway");
    expect(response.headers.get("set-cookie")).toContain(
      "demo_onatchiway_session="
    );
  });
});
