import { resolveClientIp } from "@/lib/client-ip";

const LOCAL_SMTP_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "::1",
  "[::1]",
  "mailpit"
]);

export const MAGIC_LINK_MAX_AGE_SECONDS = 15 * 60;
export const AUTH_SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

const MAX_AUTH_EMAIL_LENGTH = 254;
const MAX_AUTH_EMAIL_LOCAL_LENGTH = 64;
const MAX_AUTH_EMAIL_DOMAIN_LENGTH = 253;
const AUTH_EMAIL_LOCAL_PART = /^[\p{L}\p{N}!#$%&'*+/=?^_`{|}~.-]+$/u;
const AUTH_EMAIL_DOMAIN_LABEL = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

type Environment = Record<string, string | undefined>;

function isEnabled(value: string | undefined) {
  const normalized = value?.trim().toLowerCase();
  return normalized === "1" || normalized === "true";
}

function parsePort(value: string | undefined) {
  const port = Number(value || "1025");
  return Number.isInteger(port) && port > 0 && port <= 65_535 ? port : null;
}

export function normalizeAuthEmail(value: string) {
  if (/[\r\n]/.test(value)) {
    throw new TypeError("Adresse courriel invalide.");
  }

  const normalized = value.normalize("NFKC").trim().toLowerCase();
  const separatorIndex = normalized.indexOf("@");

  if (
    !normalized ||
    normalized.length > MAX_AUTH_EMAIL_LENGTH ||
    /[,"<>\\]/.test(normalized) ||
    separatorIndex <= 0 ||
    separatorIndex !== normalized.lastIndexOf("@")
  ) {
    throw new TypeError("Adresse courriel invalide.");
  }

  const localPart = normalized.slice(0, separatorIndex);
  const domain = normalized.slice(separatorIndex + 1);
  const domainLabels = domain.split(".");
  const localPartIsValid =
    localPart.length <= MAX_AUTH_EMAIL_LOCAL_LENGTH &&
    !localPart.startsWith(".") &&
    !localPart.endsWith(".") &&
    !localPart.includes("..") &&
    AUTH_EMAIL_LOCAL_PART.test(localPart);
  const domainIsValid =
    domain.length > 0 &&
    domain.length <= MAX_AUTH_EMAIL_DOMAIN_LENGTH &&
    domainLabels.every((label) => AUTH_EMAIL_DOMAIN_LABEL.test(label));

  if (!localPartIsValid || !domainIsValid) {
    throw new TypeError("Adresse courriel invalide.");
  }

  return normalized;
}

function tryNormalizeAuthEmail(value: string) {
  try {
    return normalizeAuthEmail(value);
  } catch {
    return null;
  }
}

export function getBootstrapAdminEmails(
  env: Environment = process.env
): Set<string> {
  return new Set(
    (env.LMS_BOOTSTRAP_ADMIN_EMAILS || "")
      .split(/[;,\r\n]/)
      .map(tryNormalizeAuthEmail)
      .filter((email): email is string => Boolean(email))
  );
}

export function isBootstrapAdminEmail(
  email: string | null | undefined,
  env: Environment = process.env
) {
  if (!email) return false;
  const normalized = tryNormalizeAuthEmail(email);
  return Boolean(normalized && getBootstrapAdminEmails(env).has(normalized));
}

export function getSafeAuthCallbackPath(
  value: string | null | undefined,
  fallback = "/mon-espace"
) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  try {
    const url = new URL(value, "https://formeducweb.local");
    if (url.origin !== "https://formeducweb.local") return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

export function getClientIp(request: Request) {
  return resolveClientIp(request);
}

export type AuthSmtpConfiguration = {
  host: string;
  port: number | null;
  secure: boolean;
  user?: string;
  pass?: string;
  from: string;
  externalServicesDisabled: boolean;
  explicitlyAllowsLocalSmtp: boolean;
};

export type AuthEmailProvider = "nodemailer" | "resend";

export function getAuthEmailProvider(
  env: Environment = process.env
): AuthEmailProvider {
  return env.AUTH_EMAIL_PROVIDER?.trim().toLowerCase() === "resend"
    ? "resend"
    : "nodemailer";
}

export type AuthResendConfiguration = {
  apiKey: string;
  from: string;
  externalServicesDisabled: boolean;
};

export function getAuthResendConfiguration(
  env: Environment = process.env
): AuthResendConfiguration {
  return {
    apiKey: env.RESEND_API_KEY?.trim() || "",
    from: env.RESEND_FROM?.trim() || "",
    externalServicesDisabled: isEnabled(env.DISABLE_EXTERNAL_SERVICES)
  };
}

export function canSendAuthEmailWithResend(
  configuration: AuthResendConfiguration
) {
  return Boolean(
    !configuration.externalServicesDisabled &&
    configuration.apiKey &&
    configuration.from
  );
}

export function getAuthSmtpConfiguration(
  env: Environment = process.env
): AuthSmtpConfiguration {
  const user = env.AUTH_SMTP_USER?.trim();
  const pass = env.AUTH_SMTP_PASS;

  return {
    host: env.AUTH_SMTP_HOST?.trim().toLowerCase() || "",
    port: parsePort(env.AUTH_SMTP_PORT),
    secure: isEnabled(env.AUTH_SMTP_SECURE),
    user: user || undefined,
    pass: user && pass ? pass : undefined,
    from:
      env.AUTH_SMTP_FROM?.trim() || "FormeducWeb <connexion@formeducweb.local>",
    externalServicesDisabled: isEnabled(env.DISABLE_EXTERNAL_SERVICES),
    explicitlyAllowsLocalSmtp: isEnabled(env.AUTH_SMTP_ALLOW_LOCAL)
  };
}

export function isLocalAuthSmtpHost(host: string) {
  return LOCAL_SMTP_HOSTS.has(host.trim().toLowerCase());
}

export function canSendAuthEmail(configuration: AuthSmtpConfiguration) {
  if (!configuration.host || configuration.port === null) return false;

  if (!configuration.externalServicesDisabled) return true;

  return (
    configuration.explicitlyAllowsLocalSmtp &&
    isLocalAuthSmtpHost(configuration.host)
  );
}
