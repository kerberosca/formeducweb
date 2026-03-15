import type { Assessment } from "@prisma/client";

import type { GeneratedReport } from "@/lib/recommendations";
import type { LiteReport } from "@/lib/reportFilters";
import type { ContactFormInput, LeadCaptureInput, PrivacyRequestInput } from "@/lib/schemas";
import type { ScoreResult } from "@/lib/scoring";

type MailOptions = {
  to: string;
  subject: string;
  html: string;
};

function getAdminNotificationEmail() {
  return process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || process.env.CONTACT_TO_EMAIL || "info@formeducweb.ca";
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

  const response = await resend.emails.send({
    from,
    to: options.to,
    subject: options.subject,
    html: options.html
  });

  if (response.error) {
    throw new Error(`Resend error: ${response.error.message}`);
  }

  return { skipped: false };
}

export async function sendAssessmentReceivedEmails(payload: {
  assessmentId: string;
  leadCapture: LeadCaptureInput;
  scoreResult: ScoreResult;
  liteReport: LiteReport;
}) {
  const adminEmail = getAdminNotificationEmail();

  await sendMail({
    to: payload.leadCapture.email,
    subject: "Votre résumé Loi 25 est prêt",
    html: `
      <h1>Votre résumé ForméducWeb</h1>
      <p>Bonjour ${payload.leadCapture.contactName},</p>
      <p>Merci d’avoir complété l’auto-évaluation Loi 25.</p>
      <p><strong>Score global :</strong> ${payload.scoreResult.overallScore}/100 (${payload.scoreResult.level.label})</p>
      <p>${payload.scoreResult.level.tagline}</p>
      <h2>Vos 3 priorités</h2>
      <ul>${payload.liteReport.topGaps.map((gap) => `<li><strong>${gap.title}</strong> — ${gap.action}</li>`).join("")}</ul>
      <p>${payload.liteReport.upsellTeaser}</p>
      <p>${payload.liteReport.disclaimers.join(" ")}</p>
    `
  });

  if (adminEmail) {
    await sendMail({
      to: adminEmail,
      subject: `Nouveau lead Loi 25 — ${payload.leadCapture.companyName}`,
      html: `
        <h1>Nouveau lead Loi 25</h1>
        <p><strong>Assessment ID :</strong> ${payload.assessmentId}</p>
        <p><strong>Nom :</strong> ${payload.leadCapture.contactName}</p>
        <p><strong>Entreprise :</strong> ${payload.leadCapture.companyName}</p>
        <p><strong>Courriel :</strong> ${payload.leadCapture.email}</p>
        <p><strong>Téléphone :</strong> ${payload.leadCapture.phone || "Non fourni"}</p>
        <p><strong>Consentement marketing :</strong> ${payload.leadCapture.consentMarketing ? "Oui" : "Non"}</p>
        <p><strong>Score :</strong> ${payload.scoreResult.overallScore}/100 (${payload.scoreResult.level.label})</p>
      `
    });
  }
}

export async function sendReportUnlockedEmails(payload: {
  assessment: Assessment;
  fullReport: GeneratedReport;
  reportUrl: string;
}) {
  const adminEmail = getAdminNotificationEmail();

  await sendMail({
    to: payload.assessment.email,
    subject: "Votre rapport complet Loi 25 est prêt",
    html: `
      <h1>Votre rapport complet est disponible</h1>
      <p>Bonjour ${payload.assessment.contactName},</p>
      <p>Votre paiement a été confirmé. Vous pouvez maintenant accéder à votre rapport complet.</p>
      <p><a href="${payload.reportUrl}">Voir mon rapport complet</a></p>
      <h2>Ce qui vous attend</h2>
      <ul>
        <li>Top 5 des écarts prioritaires détaillés</li>
        <li>Plan 30 + 90 jours</li>
        <li>PDF brandé</li>
        <li>Checklist et gabarits téléchargeables</li>
      </ul>
      <p>${payload.fullReport.disclaimers.join(" ")}</p>
    `
  });

  if (adminEmail) {
    await sendMail({
      to: adminEmail,
      subject: `Rapport complet débloqué — ${payload.assessment.companyName}`,
      html: `
        <h1>Paiement confirmé</h1>
        <p><strong>Entreprise :</strong> ${payload.assessment.companyName}</p>
        <p><strong>Contact :</strong> ${payload.assessment.contactName}</p>
        <p><strong>Courriel :</strong> ${payload.assessment.email}</p>
        <p><strong>Accès :</strong> <a href="${payload.reportUrl}">${payload.reportUrl}</a></p>
      `
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
    html: `
      <h1>Nouveau message de contact</h1>
      <p><strong>Nom :</strong> ${data.name}</p>
      <p><strong>Entreprise :</strong> ${data.company}</p>
      <p><strong>Courriel :</strong> ${data.email}</p>
      <p><strong>Téléphone :</strong> ${data.phone || "Non fourni"}</p>
      <p><strong>Motif :</strong> ${data.reason}</p>
      <p><strong>Message :</strong><br />${data.message}</p>
      <p><strong>Consentement marketing :</strong> ${data.consentMarketing ? "Oui" : "Non"}</p>
    `
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
    html: `
      <h1>Nouvelle demande de confidentialité</h1>
      <p><strong>Type:</strong> ${requestTypeLabel}</p>
      <p><strong>Nom:</strong> ${data.fullName}</p>
      <p><strong>Courriel:</strong> ${data.email}</p>
      <p><strong>Entreprise:</strong> ${data.companyName || "Non fournie"}</p>
      <p><strong>Details:</strong><br/>${data.message}</p>
    `
  });

  await sendMail({
    to: data.email,
    subject: "Confirmation de reception de votre demande",
    html: `
      <h1>Demande reçue</h1>
      <p>Bonjour ${data.fullName},</p>
      <p>Nous avons bien reçu votre demande de confidentialité (${requestTypeLabel}).</p>
      <p>Notre equipe analysera votre demande et vous reviendra dans un délai raisonnable.</p>
      <p>Ce message confirme la reception. Il ne constitue pas un avis juridique.</p>
    `
  });

  return { skipped: false };
}
