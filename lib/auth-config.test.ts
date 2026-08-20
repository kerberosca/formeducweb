import { describe, expect, it } from "vitest";

import {
  canSendAuthEmail,
  canSendAuthEmailWithResend,
  getAuthEmailProvider,
  getAuthResendConfiguration,
  getAuthSmtpConfiguration,
  getBootstrapAdminEmails,
  getClientIp,
  getSafeAuthCallbackPath,
  isBootstrapAdminEmail,
  normalizeAuthEmail
} from "@/lib/auth-config";

describe("auth configuration", () => {
  it("normalise les adresses et limite l'amorçage admin à la variable dédiée", () => {
    const env = {
      LMS_BOOTSTRAP_ADMIN_EMAILS:
        " Admin@FormeducWeb.ca ; direction@example.ca\r\nsecond@example.ca ; adresse-invalide ",
      ADMIN_EMAIL: "legacy@example.ca"
    };

    expect(normalizeAuthEmail("  ÉQUIPE@EXAMPLE.CA ")).toBe(
      "équipe@example.ca"
    );
    expect(getBootstrapAdminEmails(env)).toEqual(
      new Set([
        "admin@formeducweb.ca",
        "direction@example.ca",
        "second@example.ca"
      ])
    );
    expect(isBootstrapAdminEmail("ADMIN@FORMEDUCWEB.CA", env)).toBe(true);
    expect(isBootstrapAdminEmail("legacy@example.ca", env)).toBe(false);
    expect(isBootstrapAdminEmail("adresse-invalide", env)).toBe(false);
  });

  it.each([
    "victime@example.ca,attaquant@example.ca",
    "victime@example.ca\r\nBcc: attaquant@example.ca",
    '"victime@example.ca"@example.ca',
    "victime@@example.ca",
    "Victime <victime@example.ca>",
    ".victime@example.ca",
    "victime..test@example.ca",
    "victime@-example.ca",
    `${"a".repeat(65)}@example.ca`,
    `${"a".repeat(244)}@example.ca`
  ])("refuse l'identifiant courriel ambigu ou dangereux %s", (email) => {
    expect(() => normalizeAuthEmail(email)).toThrow(
      "Adresse courriel invalide"
    );
  });

  it("conserve les adresses légitimes normalisées", () => {
    expect(normalizeAuthEmail(" Équipe.Test+LMS@Example-Formation.ca ")).toBe(
      "équipe.test+lms@example-formation.ca"
    );
  });

  it("refuse les redirections externes et les URL à double barre", () => {
    expect(getSafeAuthCallbackPath("/formations/excel/apprendre?lecon=1")).toBe(
      "/formations/excel/apprendre?lecon=1"
    );
    expect(getSafeAuthCallbackPath("https://evil.example/path")).toBe(
      "/mon-espace"
    );
    expect(getSafeAuthCallbackPath("//evil.example/path")).toBe("/mon-espace");
  });

  it("ignore par défaut l'adresse IP transmise par le client", () => {
    const request = new Request("https://formeducweb.ca/connexion", {
      headers: { "x-forwarded-for": "203.0.113.9, 10.0.0.2" }
    });

    expect(getClientIp(request)).toBe("unknown");
  });

  it("autorise Mailpit local explicitement même avec les services externes bloqués", () => {
    const configuration = getAuthSmtpConfiguration({
      DISABLE_EXTERNAL_SERVICES: "1",
      AUTH_SMTP_ALLOW_LOCAL: "1",
      AUTH_SMTP_HOST: "mailpit",
      AUTH_SMTP_PORT: "1025",
      AUTH_SMTP_FROM: "FormeducWeb <connexion@formeducweb.local>"
    });

    expect(canSendAuthEmail(configuration)).toBe(true);
  });

  it("bloque un SMTP externe lorsque les services externes sont désactivés", () => {
    const configuration = getAuthSmtpConfiguration({
      DISABLE_EXTERNAL_SERVICES: "true",
      AUTH_SMTP_ALLOW_LOCAL: "1",
      AUTH_SMTP_HOST: "smtp.example.com",
      AUTH_SMTP_PORT: "587"
    });

    expect(canSendAuthEmail(configuration)).toBe(false);
  });

  it("exige une activation locale explicite et un port valide", () => {
    expect(
      canSendAuthEmail(
        getAuthSmtpConfiguration({
          DISABLE_EXTERNAL_SERVICES: "1",
          AUTH_SMTP_HOST: "mailpit",
          AUTH_SMTP_PORT: "1025"
        })
      )
    ).toBe(false);

    expect(
      canSendAuthEmail(
        getAuthSmtpConfiguration({
          DISABLE_EXTERNAL_SERVICES: "0",
          AUTH_SMTP_HOST: "smtp.example.com",
          AUTH_SMTP_PORT: "99999"
        })
      )
    ).toBe(false);
  });

  it("sélectionne Resend seulement sur demande explicite", () => {
    expect(getAuthEmailProvider({})).toBe("nodemailer");
    expect(getAuthEmailProvider({ AUTH_EMAIL_PROVIDER: "resend" })).toBe(
      "resend"
    );
    expect(getAuthEmailProvider({ AUTH_EMAIL_PROVIDER: "unknown" })).toBe(
      "nodemailer"
    );
  });

  it("interdit Resend lorsque les services externes sont désactivés", () => {
    expect(
      canSendAuthEmailWithResend(
        getAuthResendConfiguration({
          DISABLE_EXTERNAL_SERVICES: "1",
          RESEND_API_KEY: "re_test",
          RESEND_FROM: "FormeducWeb <test@example.ca>"
        })
      )
    ).toBe(false);

    expect(
      canSendAuthEmailWithResend(
        getAuthResendConfiguration({
          DISABLE_EXTERNAL_SERVICES: "0",
          RESEND_API_KEY: "re_test",
          RESEND_FROM: "FormeducWeb <test@example.ca>"
        })
      )
    ).toBe(true);
  });
});
