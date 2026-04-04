import type { Assessment } from "@prisma/client";

import { getBaseUrl } from "@/lib/payments";
import type { GeneratedReport } from "@/lib/recommendations";
import type { LiteReport } from "@/lib/reportFilters";
import type { ContactFormInput, LeadCaptureInput, PrivacyRequestInput } from "@/lib/schemas";
import type { ScoreResult } from "@/lib/scoring";

type MailOptions = {
  to: string;
  subject: string;
  html: string;
};

const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1"]);
const DEFAULT_EMAIL_PUBLIC_BASE_URL = "https://formeducweb.ca";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getAdminNotificationEmail() {
  return process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || process.env.CONTACT_TO_EMAIL || "info@formeducweb.ca";
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function nl2br(value: string) {
  return escapeHtml(value).replace(/\r?\n/g, "<br />");
}

function withProtocol(url: string) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function normalizeBaseUrl(url: string) {
  const parsedUrl = new URL(withProtocol(url.trim()));

  if (!LOCAL_HOSTNAMES.has(parsedUrl.hostname.toLowerCase())) {
    parsedUrl.protocol = "https:";
  }

  return parsedUrl.toString().replace(/\/+$/, "");
}

function getEmailPublicBaseUrl() {
  const explicitEmailBaseUrl = process.env.EMAIL_PUBLIC_BASE_URL?.trim();
  if (explicitEmailBaseUrl) {
    return normalizeBaseUrl(explicitEmailBaseUrl);
  }

  const appBaseUrl = getBaseUrl();

  try {
    const parsedUrl = new URL(withProtocol(appBaseUrl));
    if (!LOCAL_HOSTNAMES.has(parsedUrl.hostname.toLowerCase())) {
      return normalizeBaseUrl(appBaseUrl);
    }
  } catch {
    // fallback handled below
  }

  const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProductionUrl) {
    return normalizeBaseUrl(vercelProductionUrl);
  }

  return normalizeBaseUrl(DEFAULT_EMAIL_PUBLIC_BASE_URL);
}

function toAbsoluteUrl(pathOrUrl: string) {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    try {
      const parsedUrl = new URL(pathOrUrl);
      if (LOCAL_HOSTNAMES.has(parsedUrl.hostname.toLowerCase())) {
        return `${getEmailPublicBaseUrl()}${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
      }
    } catch {
      // ignore and return original input
    }

    return pathOrUrl;
  }

  const base = getEmailPublicBaseUrl().replace(/\/+$/, "");
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;

  return `${base}${path}`;
}

function getWizardUrl() {
  return toAbsoluteUrl("/loi-25/wizard");
}

function getSummaryUrl(accessToken: string) {
  return toAbsoluteUrl(`/loi-25/rapport/${accessToken}`);
}

function getContactUrl(source: string) {
  return toAbsoluteUrl(`/contact?source=${encodeURIComponent(source)}`);
}

function getBookingUrl() {
  const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL || "/contact?source=appel-loi-25";
  return toAbsoluteUrl(bookingUrl);
}

function renderPrimaryCta(label: string, href: string) {
  return `
    <p style="margin: 20px 0;">
      <a href="${href}" style="display:inline-block;padding:12px 18px;background:#0f5bd3;color:#ffffff;text-decoration:none;border-radius:999px;font-weight:600;">
        ${escapeHtml(label)}
      </a>
    </p>
  `;
}

function renderEmailLayout(title: string, contentHtml: string) {
  const logoUrl = toAbsoluteUrl("/logo-formeducweb.svg");
  const homeUrl = toAbsoluteUrl("/");

  return `
    <div style="margin:0;padding:24px;background:#f4f6fb;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:680px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;">
        <tr>
          <td style="padding:24px 28px 10px 28px;background:#ffffff;">
            <a href="${homeUrl}" style="text-decoration:none;display:inline-block;">
              <img src="${logoUrl}" alt="ForméducWeb" width="190" style="display:block;max-width:190px;height:auto;border:0;" />
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding:0 28px 8px 28px;">
            <h1 style="margin:0;font-size:24px;line-height:1.3;color:#101828;font-weight:700;">${escapeHtml(title)}</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:0 28px 28px 28px;font-size:15px;line-height:1.65;color:#344054;">
            ${contentHtml}
          </td>
        </tr>
      </table>
    </div>
  `;
}

function maskEmail(email: string) {
  const [localPart, domainPart] = email.split("@");

  if (!localPart || !domainPart) return "***";
  if (localPart.length <= 2) return `*@${domainPart}`;

  return `${localPart.slice(0, 2)}***@${domainPart}`;
}

async function sendMail(options: MailOptions) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;

  if (!apiKey || !from) {
    console.log("Email MVP fallback", {
      to: maskEmail(options.to),
      subject: options.subject
    });
    return { skipped: true };
  }

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);

  const maxAttempts = 4;
  let lastErrorMessage = "";

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const response = await resend.emails.send({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html
    });

    if (!response.error) {
      return { skipped: false };
    }

    lastErrorMessage = response.error.message;
    const isRateLimit = /too many requests/i.test(lastErrorMessage);

    if (!isRateLimit || attempt === maxAttempts) {
      break;
    }

    await sleep(350 * attempt);
  }

  throw new Error(`Resend error: ${lastErrorMessage || "Unknown error"}`);
}

export async function sendAssessmentReceivedEmails(payload: {
  assessmentId: string;
  accessToken: string;
  leadCapture: LeadCaptureInput;
  scoreResult: ScoreResult;
  liteReport: LiteReport;
}) {
  const adminEmail = getAdminNotificationEmail();
  const summaryUrl = getSummaryUrl(payload.accessToken);
  const wizardUrl = getWizardUrl();
  const bookingUrl = getBookingUrl();
  const contactUrl = getContactUrl("email-resume-loi25");
  const prioritiesHtml = payload.liteReport.topGaps
    .map((gap) => `<li><strong>${escapeHtml(gap.title)}</strong> — ${escapeHtml(gap.action)}</li>`)
    .join("");

  await sendMail({
    to: payload.leadCapture.email,
    subject: "Votre résumé Loi 25 est prêt",
    html: renderEmailLayout(
      "Votre résumé Loi 25 est prêt",
      `
      <p>Bonjour ${escapeHtml(payload.leadCapture.contactName)},</p>
      <p>Merci d’avoir complété l’auto-évaluation Loi 25.</p>
      <p><strong>Score global :</strong> ${payload.scoreResult.overallScore}/100 (${escapeHtml(payload.scoreResult.level.label)})</p>
      <p>${escapeHtml(payload.scoreResult.level.tagline)}</p>
      <h2>Vos 3 priorités</h2>
      <ul>${prioritiesHtml}</ul>
      ${payload.liteReport.prioritiesContext ? `<p>${escapeHtml(payload.liteReport.prioritiesContext)}</p>` : ""}
      <p>${escapeHtml(payload.liteReport.upsellTeaser)}</p>
      ${renderPrimaryCta("Voir mon résumé sécurisé", summaryUrl)}
      <p>Si vous préférez valider vos prochaines actions avec notre équipe:</p>
      <ul>
        <li><a href="${bookingUrl}">Réserver un appel de 20 minutes</a></li>
        <li><a href="${contactUrl}">Écrire à ForméducWeb</a></li>
      </ul>
      <p>Vous pouvez aussi refaire l’auto-évaluation à tout moment: <a href="${wizardUrl}">${wizardUrl}</a></p>
      <p>${escapeHtml(payload.liteReport.disclaimers.join(" "))}</p>
      <p style="font-size:12px;color:#5f646d;">Ce courriel fournit un résumé opérationnel. Il ne constitue pas un avis juridique.</p>
    `
    )
  });

  if (adminEmail) {
    await sendMail({
      to: adminEmail,
      subject: `Nouveau lead Loi 25 — ${payload.leadCapture.companyName}`,
      html: renderEmailLayout(
        "Nouveau lead Loi 25",
        `
        <p><strong>Assessment ID :</strong> ${payload.assessmentId}</p>
        <p><strong>Nom :</strong> ${escapeHtml(payload.leadCapture.contactName)}</p>
        <p><strong>Entreprise :</strong> ${escapeHtml(payload.leadCapture.companyName)}</p>
        <p><strong>Courriel :</strong> ${escapeHtml(payload.leadCapture.email)}</p>
        <p><strong>Téléphone :</strong> ${escapeHtml(payload.leadCapture.phone || "Non fourni")}</p>
        <p><strong>Consentement marketing :</strong> ${payload.leadCapture.consentMarketing ? "Oui" : "Non"}</p>
        <p><strong>Score :</strong> ${payload.scoreResult.overallScore}/100 (${escapeHtml(payload.scoreResult.level.label)})</p>
        <p><strong>Résumé sécurisé :</strong> <a href="${summaryUrl}">${summaryUrl}</a></p>
        <p><strong>Action suggérée :</strong> répondre en moins de 24h ouvrables si le lead a demandé un échange.</p>
      `
      )
    });
  }
}

export async function sendReportUnlockedEmails(payload: {
  assessment: Assessment;
  fullReport: GeneratedReport;
  reportUrl: string;
}) {
  const adminEmail = getAdminNotificationEmail();
  const reportUrl = toAbsoluteUrl(payload.reportUrl);
  const bookingUrl = getBookingUrl();
  const contactUrl = getContactUrl("email-paiement-confirme");
  const disclaimer = escapeHtml(payload.fullReport.disclaimers.join(" "));

  await sendMail({
    to: payload.assessment.email,
    subject: "Paiement confirmé — votre rapport complet Loi 25 est prêt",
    html: renderEmailLayout(
      "Votre rapport complet est disponible",
      `
      <p>Bonjour ${escapeHtml(payload.assessment.contactName)},</p>
      <p>Votre paiement a été confirmé. Vous pouvez maintenant accéder à votre rapport complet.</p>
      ${renderPrimaryCta("Voir mon rapport complet", reportUrl)}
      <h2>Ce qui vous attend</h2>
      <ul>
        <li>Top 5 des écarts prioritaires détaillés</li>
        <li>Plan 30 + 90 jours</li>
        <li>PDF brandé</li>
        <li>Checklist et gabarits téléchargeables</li>
      </ul>
      <p>Besoin d’un coup de pouce pour la suite? <a href="${bookingUrl}">Réserver un appel de 20 minutes</a> ou <a href="${contactUrl}">nous écrire</a>.</p>
      <p>${disclaimer}</p>
      <p style="font-size:12px;color:#5f646d;">Ce rapport aide à prioriser et implanter. Il ne constitue pas un avis juridique.</p>
    `
    )
  });

  if (adminEmail) {
    await sendMail({
      to: adminEmail,
      subject: `Paiement confirmé Loi 25 — ${payload.assessment.companyName}`,
      html: renderEmailLayout(
        "Paiement confirmé",
        `
        <p><strong>Entreprise :</strong> ${escapeHtml(payload.assessment.companyName)}</p>
        <p><strong>Contact :</strong> ${escapeHtml(payload.assessment.contactName)}</p>
        <p><strong>Courriel :</strong> ${escapeHtml(payload.assessment.email)}</p>
        <p><strong>Accès :</strong> <a href="${reportUrl}">${reportUrl}</a></p>
        <p><strong>Action suggérée :</strong> faire un suivi court (24-48h) pour proposer la prochaine étape.</p>
      `
      )
    });
  }
}

export async function sendContactEmail(data: ContactFormInput) {
  const adminEmail = process.env.CONTACT_TO_EMAIL || process.env.ADMIN_EMAIL || "info@formeducweb.ca";

  if (!adminEmail) {
    console.log("Contact MVP fallback", {
      email: maskEmail(data.email),
      reason: data.reason
    });
    return { skipped: true };
  }

  return sendMail({
    to: adminEmail,
    subject: `Nouveau message contact — ${data.company}`,
    html: renderEmailLayout(
      "Nouveau message de contact",
      `
      <p><strong>Nom :</strong> ${escapeHtml(data.name)}</p>
      <p><strong>Entreprise :</strong> ${escapeHtml(data.company)}</p>
      <p><strong>Courriel :</strong> ${escapeHtml(data.email)}</p>
      <p><strong>Téléphone :</strong> ${escapeHtml(data.phone || "Non fourni")}</p>
      <p><strong>Motif :</strong> ${escapeHtml(data.reason)}</p>
      <p><strong>Message :</strong><br />${nl2br(data.message)}</p>
      <p><strong>Consentement marketing :</strong> ${data.consentMarketing ? "Oui" : "Non"}</p>
    `
    )
  });
}

function mapPrivacyRequestType(requestType: PrivacyRequestInput["requestType"]) {
  switch (requestType) {
    case "access":
      return "Accès";
    case "rectification":
      return "Rectification";
    case "deletion":
      return "Suppression";
    case "withdrawal":
      return "Retrait de consentement";
    default:
      return "Question générale";
  }
}

export async function sendPrivacyRequestEmail(data: PrivacyRequestInput) {
  const adminEmail = getAdminNotificationEmail();
  const requestTypeLabel = mapPrivacyRequestType(data.requestType);

  if (!adminEmail) {
    console.log("Privacy request fallback", {
      email: maskEmail(data.email),
      requestType: requestTypeLabel
    });
    return { skipped: true };
  }

  await sendMail({
    to: adminEmail,
    subject: `Demande confidentialité - ${requestTypeLabel}`,
    html: renderEmailLayout(
      "Nouvelle demande de confidentialité",
      `
      <p><strong>Type:</strong> ${requestTypeLabel}</p>
      <p><strong>Nom:</strong> ${escapeHtml(data.fullName)}</p>
      <p><strong>Courriel:</strong> ${escapeHtml(data.email)}</p>
      <p><strong>Entreprise:</strong> ${escapeHtml(data.companyName || "Non fournie")}</p>
      <p><strong>Details:</strong><br/>${nl2br(data.message)}</p>
    `
    )
  });

  await sendMail({
    to: data.email,
    subject: "Confirmation de reception de votre demande",
    html: renderEmailLayout(
      "Demande reçue",
      `
      <p>Bonjour ${escapeHtml(data.fullName)},</p>
      <p>Nous avons bien reçu votre demande de confidentialité (${requestTypeLabel}).</p>
      <p>Notre equipe analysera votre demande et vous reviendra dans un délai raisonnable.</p>
      <p>Ce message confirme la reception. Il ne constitue pas un avis juridique.</p>
    `
    )
  });

  return { skipped: false };
}
