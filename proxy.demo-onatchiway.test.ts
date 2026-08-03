import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  createDemoOnatchiwaySessionToken,
  DEMO_ONATCHIWAY_COOKIE_NAME
} from "@/lib/demo-onatchiway-session";
import { proxy } from "@/proxy";

describe("protection HTTP de la démo Onatchiway", () => {
  const secret = "test-session-secret-that-is-long-enough";

  beforeEach(() => {
    process.env.DEMO_ONATCHIWAY_SESSION_SECRET = secret;
  });

  afterEach(() => {
    delete process.env.DEMO_ONATCHIWAY_SESSION_SECRET;
  });

  it("réécrit la racine non authentifiée vers la page d'accès", () => {
    const response = proxy(
      new NextRequest("https://formeducweb.ca/demoOnatchiway", {
        headers: { "user-agent": "MessengerForiOS" }
      })
    );

    expect(response.headers.get("x-middleware-rewrite")).toContain(
      "/demoOnatchiway/acces"
    );
    expect(response.headers.get("x-robots-tag")).toContain("noindex");
    expect(response.headers.get("cache-control")).toContain("no-store");
  });

  it("laisse le robot Messenger charger uniquement l'aperçu neutre", () => {
    const response = proxy(
      new NextRequest(
        "https://formeducweb.ca/demoOnatchiway/apercu-prive.png",
        { headers: { "user-agent": "facebookexternalhit/1.1" } }
      )
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("refuse une ressource protégée sans session", () => {
    const response = proxy(
      new NextRequest(
        "https://formeducweb.ca/demoOnatchiway/onatchiway-cover.webp"
      )
    );

    expect(response.status).toBe(401);
  });

  it("autorise le site et ses ressources avec une session valide", () => {
    const token = createDemoOnatchiwaySessionToken(secret);
    const request = new NextRequest(
      "https://formeducweb.ca/demoOnatchiway/site.css",
      {
        headers: {
          cookie: `${DEMO_ONATCHIWAY_COOKIE_NAME}=${token}`
        }
      }
    );
    const response = proxy(request);

    expect(response.status).toBe(200);
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("laisse la page publique des services web accessible sans session", () => {
    const response = proxy(
      new NextRequest("https://formeducweb.ca/services/site-web")
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(response.headers.get("x-robots-tag")).toBeNull();
  });
});
