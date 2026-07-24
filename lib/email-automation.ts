import { createHmac, timingSafeEqual } from "node:crypto";

import type { EmailJob, Prisma, Subscriber } from "@prisma/client";

import { db } from "@/lib/db";
import { sendCommercialEmail } from "@/lib/email";

export const MARKETING_EMAIL_KINDS = [
  "diagnostic_day_1",
  "diagnostic_day_4",
  "diagnostic_day_7",
  "trio_upgrade"
] as const;

export type MarketingEmailKind = (typeof MARKETING_EMAIL_KINDS)[number];

type DiagnosticNurtureInput = {
  email: string;
  consentMarketing: boolean;
  source: string;
  contextId: string;
  diagnostic: string;
  resultUrl: string;
  companyName?: string | null;
};

type UpgradeInput = {
  email: string;
  orderId: string;
  productCode: string;
  diagnostic: string;
  dashboardUrl: string;
};

type MarketingPayload = {
  diagnostic?: string;
  resultUrl?: string;
  companyName?: string;
  productCode?: string;
  dashboardUrl?: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_ATTEMPTS = 4;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getUnsubscribeSecret() {
  const secret =
    process.env.EMAIL_UNSUBSCRIBE_SECRET?.trim() ||
    process.env.STRIPE_WEBHOOK_SECRET?.trim();

  if (secret) return secret;
  if (process.env.NODE_ENV !== "production") {
    return "formeducweb-development-unsubscribe-secret";
  }

  throw new Error("EMAIL_UNSUBSCRIBE_SECRET is required in production.");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getPublicBaseUrl() {
  const raw =
    process.env.EMAIL_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://formeducweb.ca";
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  return withProtocol.replace(/\/+$/, "");
}

function absoluteUrl(pathOrUrl: string) {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${getPublicBaseUrl()}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
}

export function createUnsubscribeToken(subscriber: {
  id: string;
  email: string;
}) {
  const body = Buffer.from(
    JSON.stringify({
      version: 1,
      subscriberId: subscriber.id,
      email: normalizeEmail(subscriber.email)
    })
  ).toString("base64url");
  const signature = createHmac("sha256", getUnsubscribeSecret())
    .update(body)
    .digest("base64url");

  return `${body}.${signature}`;
}

export function verifyUnsubscribeToken(token: string) {
  try {
    const [body, receivedSignature, extra] = token.split(".");
    if (!body || !receivedSignature || extra) return null;

    const expectedSignature = createHmac("sha256", getUnsubscribeSecret())
      .update(body)
      .digest("base64url");
    const expected = Buffer.from(expectedSignature);
    const received = Buffer.from(receivedSignature);
    if (
      expected.length !== received.length ||
      !timingSafeEqual(expected, received)
    ) {
      return null;
    }

    const parsed = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    ) as {
      version?: number;
      subscriberId?: string;
      email?: string;
    };

    if (
      parsed.version !== 1 ||
      !parsed.subscriberId ||
      !parsed.email ||
      !parsed.email.includes("@")
    ) {
      return null;
    }

    return {
      subscriberId: parsed.subscriberId,
      email: normalizeEmail(parsed.email)
    };
  } catch {
    return null;
  }
}

export function buildUnsubscribeUrl(subscriber: { id: string; email: string }) {
  const token = createUnsubscribeToken(subscriber);
  return absoluteUrl(`/desabonnement?token=${encodeURIComponent(token)}`);
}

export async function recordSubscriberConsent(input: {
  email: string;
  consentMarketing: boolean;
  source: string;
}) {
  const email = normalizeEmail(input.email);

  if (!input.consentMarketing) {
    return db.subscriber.upsert({
      where: { email },
      create: {
        email,
        consentMarketing: false,
        consentSource: input.source
      },
      update: {}
    });
  }

  const now = new Date();
  return db.subscriber.upsert({
    where: { email },
    create: {
      email,
      consentMarketing: true,
      consentSource: input.source,
      consentedAt: now
    },
    update: {
      consentMarketing: true,
      consentSource: input.source,
      consentedAt: now,
      unsubscribedAt: null
    }
  });
}

async function createEmailJob(input: {
  subscriberId: string;
  orderId?: string;
  kind: MarketingEmailKind;
  toEmail: string;
  scheduledAt: Date;
  idempotencyKey: string;
  payload: MarketingPayload;
}) {
  return db.emailJob.upsert({
    where: { idempotencyKey: input.idempotencyKey },
    create: {
      subscriberId: input.subscriberId,
      orderId: input.orderId,
      kind: input.kind,
      toEmail: normalizeEmail(input.toEmail),
      scheduledAt: input.scheduledAt,
      idempotencyKey: input.idempotencyKey,
      payload: input.payload as Prisma.InputJsonValue
    },
    update: {}
  });
}

export async function scheduleDiagnosticNurture(
  input: DiagnosticNurtureInput,
  now = new Date()
) {
  const subscriber = await recordSubscriberConsent({
    email: input.email,
    consentMarketing: input.consentMarketing,
    source: input.source
  });

  if (
    !input.consentMarketing ||
    !subscriber.consentMarketing ||
    subscriber.unsubscribedAt
  ) {
    return [];
  }

  const payload: MarketingPayload = {
    diagnostic: input.diagnostic,
    resultUrl: input.resultUrl,
    companyName: input.companyName || undefined
  };
  const schedule = [
    { kind: "diagnostic_day_1" as const, days: 1 },
    { kind: "diagnostic_day_4" as const, days: 4 },
    { kind: "diagnostic_day_7" as const, days: 7 }
  ];

  return Promise.all(
    schedule.map(({ kind, days }) =>
      createEmailJob({
        subscriberId: subscriber.id,
        kind,
        toEmail: subscriber.email,
        scheduledAt: new Date(now.getTime() + days * DAY_MS),
        idempotencyKey: `${input.contextId}:${kind}`,
        payload
      })
    )
  );
}

export async function scheduleTrioUpgrade(input: UpgradeInput) {
  const subscriber = await db.subscriber.findUnique({
    where: { email: normalizeEmail(input.email) }
  });

  if (
    !subscriber ||
    !subscriber.consentMarketing ||
    subscriber.unsubscribedAt
  ) {
    return null;
  }

  return createEmailJob({
    subscriberId: subscriber.id,
    orderId: input.orderId,
    kind: "trio_upgrade",
    toEmail: subscriber.email,
    scheduledAt: new Date(),
    idempotencyKey: `${input.orderId}:trio_upgrade`,
    payload: {
      productCode: input.productCode,
      diagnostic: input.diagnostic,
      dashboardUrl: input.dashboardUrl
    }
  });
}

function readPayload(payload: Prisma.JsonValue | null): MarketingPayload {
  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return {};
  }

  const record = payload as Record<string, Prisma.JsonValue>;
  const text = (key: string) =>
    typeof record[key] === "string" ? (record[key] as string) : undefined;

  return {
    diagnostic: text("diagnostic"),
    resultUrl: text("resultUrl"),
    companyName: text("companyName"),
    productCode: text("productCode"),
    dashboardUrl: text("dashboardUrl")
  };
}

export function buildMarketingEmail(
  kind: MarketingEmailKind,
  payload: MarketingPayload,
  subscriber: Pick<Subscriber, "id" | "email">
) {
  const diagnostic = escapeHtml(payload.diagnostic || "hygiène numérique");
  const resultUrl = absoluteUrl(payload.resultUrl || "/services");
  const dashboardUrl = absoluteUrl(payload.dashboardUrl || resultUrl);
  const sampleSlug =
    payload.diagnostic === "ai"
      ? "intelligence-artificielle"
      : payload.diagnostic === "cybersecurity"
        ? "cybersecurite"
        : "loi-25";
  const sampleUrl = absoluteUrl(`/exemples/${sampleSlug}`);
  const unsubscribeUrl = buildUnsubscribeUrl(subscriber);

  switch (kind) {
    case "diagnostic_day_1":
      return {
        subject: "Votre première action utile en 15 minutes",
        title: "Une petite action, aujourd’hui",
        unsubscribeUrl,
        contentHtml: `
          <p>Bonjour,</p>
          <p>À partir de votre diagnostic ${diagnostic}, choisissez une seule
          priorité et nommez un responsable ainsi qu’une date de vérification.
          Quinze minutes suffisent pour transformer le résultat en action.</p>
          <p><a href="${escapeHtml(resultUrl)}">Retourner à mon résultat</a></p>
        `
      };
    case "diagnostic_day_4":
      return {
        subject: "À quoi ressemble un Kit d’exécution 90 jours?",
        title: "Un aperçu concret du kit",
        unsubscribeUrl,
        contentHtml: `
          <p>Le Kit d’exécution 90 jours ne se limite pas à un score. Il
          rassemble un plan priorisé et des gabarits éditables pour le
          diagnostic ${diagnostic}.</p>
          <p>Voyez les aperçus fictifs avant de décider :
          <a href="${escapeHtml(sampleUrl)}">consulter l’exemple fictif</a>.</p>
          <p><a href="${escapeHtml(resultUrl)}">Revoir mes priorités</a></p>
        `
      };
    case "diagnostic_day_7":
      return {
        subject: "Votre kit à 29 $ ou les trois diagnostics à 59 $",
        title: "Choisissez la prochaine étape utile",
        unsubscribeUrl,
        contentHtml: `
          <p>Le kit individuel coûte 29 $ CAD. Le Trio Hygiène numérique,
          à 59 $ CAD, réunit IA, cybersécurité et Loi 25 dans un même tableau
          de bord.</p>
          <p>Accès de 730 jours, crédit de 29 $ valable 90 jours sur un
          accompagnement admissible et remboursement sous 7 jours avec
          révocation de l’accès.</p>
          <p><a href="${escapeHtml(resultUrl)}">Choisir mon kit</a></p>
        `
      };
    case "trio_upgrade":
      return {
        subject: "Ajoutez les deux autres kits pour 30 $",
        title: "Passez au Trio Hygiène numérique",
        unsubscribeUrl,
        contentHtml: `
          <p>Votre achat individuel peut être amélioré vers le Trio pour
          30 $ CAD. Vous obtenez alors les droits d’accès aux trois diagnostics
          et à leurs Kits d’exécution 90 jours.</p>
          <p><a href="${escapeHtml(dashboardUrl)}">Voir l’amélioration Trio</a></p>
        `
      };
  }
}

function isMarketingKind(kind: string): kind is MarketingEmailKind {
  return MARKETING_EMAIL_KINDS.includes(kind as MarketingEmailKind);
}

async function cancelJob(job: EmailJob, reason: string) {
  await db.emailJob.update({
    where: { id: job.id },
    data: {
      status: "canceled",
      cancelledAt: new Date(),
      lastError: reason
    }
  });
}

export async function processDueEmailJobs(options?: {
  now?: Date;
  limit?: number;
}) {
  const now = options?.now || new Date();
  const limit = Math.max(1, Math.min(options?.limit || 25, 100));
  const jobs = await db.emailJob.findMany({
    where: {
      status: "scheduled",
      scheduledAt: { lte: now },
      sentAt: null,
      cancelledAt: null,
      attempts: { lt: MAX_ATTEMPTS }
    },
    orderBy: { scheduledAt: "asc" },
    take: limit
  });
  const result = { considered: jobs.length, sent: 0, cancelled: 0, failed: 0 };

  for (const job of jobs) {
    const claimed = await db.emailJob.updateMany({
      where: {
        id: job.id,
        sentAt: null,
        cancelledAt: null,
        attempts: job.attempts
      },
      data: { attempts: { increment: 1 } }
    });
    if (claimed.count !== 1) continue;

    if (!isMarketingKind(job.kind) || !job.subscriberId) {
      await cancelJob(job, "Type de courriel ou abonné invalide.");
      result.cancelled += 1;
      continue;
    }

    const subscriber = await db.subscriber.findUnique({
      where: { id: job.subscriberId }
    });
    if (
      !subscriber ||
      normalizeEmail(subscriber.email) !== normalizeEmail(job.toEmail) ||
      !subscriber.consentMarketing ||
      subscriber.unsubscribedAt
    ) {
      await cancelJob(job, "Consentement marketing absent ou retiré.");
      result.cancelled += 1;
      continue;
    }

    try {
      const message = buildMarketingEmail(
        job.kind,
        readPayload(job.payload),
        subscriber
      );
      const delivery = await sendCommercialEmail({
        to: subscriber.email,
        idempotencyKey: job.idempotencyKey,
        ...message
      });
      if (delivery.skipped) {
        throw new Error(
          "Envoi commercial non configuré; vérifiez Resend et DISABLE_EXTERNAL_SERVICES."
        );
      }
      await db.emailJob.update({
        where: { id: job.id },
        data: {
          status: "sent",
          sentAt: new Date(),
          lastError: null
        }
      });
      result.sent += 1;
    } catch (error) {
      await db.emailJob.update({
        where: { id: job.id },
        data: {
          status: job.attempts + 1 >= MAX_ATTEMPTS ? "failed" : "scheduled",
          lastError:
            error instanceof Error ? error.message.slice(0, 500) : "Erreur"
        }
      });
      result.failed += 1;
    }
  }

  return result;
}

export async function unsubscribeByToken(token: string) {
  const verified = verifyUnsubscribeToken(token);
  if (!verified) return null;

  const subscriber = await db.subscriber.findUnique({
    where: { id: verified.subscriberId }
  });
  if (!subscriber || normalizeEmail(subscriber.email) !== verified.email) {
    return null;
  }

  const unsubscribedAt = subscriber.unsubscribedAt || new Date();
  await db.$transaction([
    db.subscriber.update({
      where: { id: subscriber.id },
      data: {
        consentMarketing: false,
        unsubscribedAt
      }
    }),
    db.emailJob.updateMany({
      where: {
        OR: [
          { subscriberId: subscriber.id },
          { toEmail: normalizeEmail(subscriber.email) }
        ],
        sentAt: null,
        cancelledAt: null
      },
      data: {
        status: "canceled",
        cancelledAt: unsubscribedAt,
        lastError: "Désabonnement"
      }
    })
  ]);

  return {
    email: subscriber.email,
    unsubscribedAt
  };
}
