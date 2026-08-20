import { NextRequest } from "next/server";
import { afterEach, describe, expect, it } from "vitest";

import { proxy } from "@/proxy";

const originalTrustedProxyHeaders = process.env.TRUSTED_PROXY_HEADERS;

function request(headers: HeadersInit) {
  const requestHeaders = new Headers(headers);
  requestHeaders.set("host", "formeducweb.ca");
  return new NextRequest("http://formeducweb.ca/connexion", {
    headers: requestHeaders
  });
}

describe("proxy transport security", () => {
  afterEach(() => {
    if (originalTrustedProxyHeaders === undefined) {
      delete process.env.TRUSTED_PROXY_HEADERS;
    } else {
      process.env.TRUSTED_PROXY_HEADERS = originalTrustedProxyHeaders;
    }
  });

  it.each([
    ["x-forwarded-proto", "https"],
    ["x-forwarded-host", "localhost"]
  ])(
    "ignore l’en-tête proxy falsifié %s sans confiance explicite",
    (headerName, headerValue) => {
      delete process.env.TRUSTED_PROXY_HEADERS;

      const response = proxy(request([[headerName, headerValue]]));

      expect(response.status).toBe(301);
      expect(response.headers.get("location")).toBe(
        "https://formeducweb.ca/connexion"
      );
    }
  );

  it("honore les en-têtes écrasés par un proxy explicitement fiable", () => {
    process.env.TRUSTED_PROXY_HEADERS = "true";

    const response = proxy(
      request({
        "x-forwarded-proto": "https",
        "x-forwarded-host": "formeducweb.ca"
      })
    );

    expect(response.status).toBe(200);
  });
});
