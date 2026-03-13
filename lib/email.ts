import type { AssessmentPayloadInput, ContactFormInput } from "@/lib/schemas";
import type { GeneratedReport } from "@/lib/recommendations";
import type { ScoreResult } from "@/lib/scoring";

type MailOptions = {
  to: string;
  subject: string;
  html: string;
};

async function sendMail(options: MailOptions) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;

  if (!apiKey || !from) {
    console.log("Email MVP fallback", options);
    return { skipped: true };
  }

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);

  await resend.emails.send({
    from,
    to: options.to,
    subject: options.subject,
    html: options.html
  });

  return { skipped: false };
}

export async function sendAssessmentEmails(payload: {
  leadCapture: AssessmentPayloadInput["leadCapture"];
  scoreResult: ScoreResult;
  report: GeneratedReport;
}) {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.CONTACT_TO_EMAIL;

  const customerHtml = `
    <h1>Votre rapport FormÉducWeb</h1>
    <p>Bonjour ${payload.leadCapture.contactName},</p>
    <p>Merci d’avoir complété l’auto-évaluation Loi 25.</p>
    <p>Score global : <strong>${payload.scoreResult.overallScore}/100</strong> (${payload.scoreResult.level.label})</p>
    <p>${payload.scoreResult.level.tagline}</p>
    <h2>Priorités</h2>
    <ul>${payload.report.topGaps
      .map((gap) => `<li><strong>${gap.title}</strong> — ${gap.action}</li>`)
      .join("")}</ul>
    <p>${payload.report.disclaimers.join(" ")}</p>
  `;

  await sendMail({
    to: payload.leadCapture.email,
    subject: "Votre rapport d’auto-évaluation Loi 25",
    html: customerHtml
  });

  if (adminEmail) {
    await sendMail({
      to: adminEmail,
      subject: `Nouvelle auto-évaluation Loi 25 — ${payload.leadCapture.companyName}`,
      html: `
        <h1>Nouveau lead Loi 25</h1>
        <p><strong>Nom :</strong> ${payload.leadCapture.contactName}</p>
        <p><strong>Entreprise :</strong> ${payload.leadCapture.companyName}</p>
        <p><strong>Courriel :</strong> ${payload.leadCapture.email}</p>
        <p><strong>Téléphone :</strong> ${payload.leadCapture.phone || "Non fourni"}</p>
        <p><strong>Consentement marketing :</strong> ${
          payload.leadCapture.consentMarketing ? "Oui" : "Non"
        }</p>
        <p><strong>Score :</strong> ${payload.scoreResult.overallScore}/100 (${payload.scoreResult.level.label})</p>
      `
    });
  }
}

export async function sendContactEmail(data: ContactFormInput) {
  const adminEmail = process.env.CONTACT_TO_EMAIL || process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    console.log("Contact MVP fallback", data);
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
