import { createTransport } from "nodemailer";

import {
  canSendAuthEmail,
  canSendAuthEmailWithResend,
  getAuthResendConfiguration,
  getAuthSmtpConfiguration,
  getClientIp,
  normalizeAuthEmail
} from "@/lib/auth-config";
import { db } from "@/lib/db";
import { consumeMagicLinkRateLimit } from "@/lib/auth-rate-limit";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

type MagicLinkRequest = {
  identifier: string;
  url: string;
  request: Request;
};

async function canDeliverMagicLink({
  identifier,
  request
}: Pick<MagicLinkRequest, "identifier" | "request">) {
  const email = normalizeAuthEmail(identifier);
  const ip = getClientIp(request);
  const rateLimitWasCheckedByRoute =
    request.headers.get("x-formeduc-auth-rate-limit-checked") === "1";
  const [rateLimitAllowsRequest, existingUser] = await Promise.all([
    rateLimitWasCheckedByRoute
      ? Promise.resolve(true)
      : consumeMagicLinkRateLimit({ email, ip }),
    db.user.findUnique({
      where: { email },
      select: { isActive: true }
    })
  ]);

  return {
    email,
    allowed: rateLimitAllowsRequest && existingUser?.isActive !== false
  };
}

function renderMagicLinkMessage(url: string) {
  const safeUrl = escapeHtml(url);
  return {
    subject: "Votre lien de connexion FormeducWeb",
    text: [
      "Bonjour,",
      "",
      "Utilisez ce lien à usage unique pour vous connecter à FormeducWeb :",
      url,
      "",
      "Le lien expire dans 15 minutes. Si vous n'avez pas demandé ce lien, ignorez ce message."
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#10213a;max-width:620px;margin:0 auto;padding:24px">
        <p>Bonjour,</p>
        <p>Utilisez le bouton ci-dessous pour vous connecter à FormeducWeb.</p>
        <p style="margin:28px 0">
          <a href="${safeUrl}" style="display:inline-block;background:#1571d4;color:#fff;text-decoration:none;font-weight:700;padding:13px 22px;border-radius:999px">Me connecter</a>
        </p>
        <p>Ce lien est à usage unique et expire dans 15 minutes.</p>
        <p style="color:#59677a;font-size:14px">Si vous n'avez pas demandé ce lien, vous pouvez ignorer ce message.</p>
      </div>
    `
  };
}

export async function sendMagicLinkEmail({
  identifier,
  url,
  request
}: MagicLinkRequest) {
  const configuration = getAuthSmtpConfiguration();
  const delivery = await canDeliverMagicLink({ identifier, request });

  // The caller deliberately receives the same response in each of these cases.
  // This avoids revealing whether an address belongs to an existing account.
  if (!delivery.allowed || !canSendAuthEmail(configuration)) {
    return;
  }

  const transport = createTransport({
    host: configuration.host,
    port: configuration.port!,
    secure: configuration.secure,
    disableFileAccess: true,
    disableUrlAccess: true,
    auth:
      configuration.user && configuration.pass
        ? { user: configuration.user, pass: configuration.pass }
        : undefined
  });
  const message = renderMagicLinkMessage(url);

  const result = await transport.sendMail({
    to: delivery.email,
    from: configuration.from,
    ...message
  });

  const failedRecipients = [
    ...(result.rejected || []),
    ...(result.pending || [])
  ].filter(Boolean);

  if (failedRecipients.length > 0) {
    throw new Error("Le serveur SMTP n'a pas accepté le message de connexion.");
  }
}

export async function sendMagicLinkEmailWithResend({
  identifier,
  url,
  request
}: MagicLinkRequest) {
  const configuration = getAuthResendConfiguration();
  const delivery = await canDeliverMagicLink({ identifier, request });

  // Resend is opt-in only and can never bypass the local external-service lock.
  if (!delivery.allowed || !canSendAuthEmailWithResend(configuration)) return;

  const { Resend } = await import("resend");
  const resend = new Resend(configuration.apiKey);
  const response = await resend.emails.send({
    from: configuration.from,
    to: delivery.email,
    ...renderMagicLinkMessage(url)
  });

  if (response.error) {
    throw new Error("Resend n'a pas accepté le message de connexion.");
  }
}
