import { describe, expect, it } from "vitest";

import { resolveClientIp, UNKNOWN_CLIENT_IP } from "@/lib/client-ip";

describe("resolveClientIp", () => {
  const spoofedHeaders = new Headers({
    "x-forwarded-for": "203.0.113.9, 10.0.0.2",
    "x-real-ip": "198.51.100.8",
    "cf-connecting-ip": "192.0.2.7"
  });

  it("ignore tous les en-têtes proxy sans activation explicite", () => {
    expect(resolveClientIp(spoofedHeaders, {})).toBe(UNKNOWN_CLIENT_IP);
    expect(
      resolveClientIp(spoofedHeaders, { TRUSTED_PROXY_HEADERS: "yes" })
    ).toBe(UNKNOWN_CLIENT_IP);
  });

  it("accepte une IP valide lorsque le proxy est explicitement fiable", () => {
    expect(
      resolveClientIp(spoofedHeaders, { TRUSTED_PROXY_HEADERS: "1" })
    ).toBe("203.0.113.9");
    expect(
      resolveClientIp(new Headers({ "x-forwarded-for": "2001:db8::1" }), {
        TRUSTED_PROXY_HEADERS: "true"
      })
    ).toBe("2001:db8::1");
  });

  it("rejette les valeurs non IP même en mode proxy fiable", () => {
    expect(
      resolveClientIp(
        new Headers({
          "x-forwarded-for": "attaquant.example",
          "x-real-ip": "203.0.113.5:443",
          "cf-connecting-ip": "javascript:alert(1)"
        }),
        { TRUSTED_PROXY_HEADERS: "1" }
      )
    ).toBe(UNKNOWN_CLIENT_IP);
  });
});
