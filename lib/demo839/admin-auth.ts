import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getD1 } from "./data";

const SESSION_COOKIE = "escadron_admin_session";
const PASSWORD_ITERATIONS = 600_000;
const IDLE_HOURS = 8;
const ABSOLUTE_DAYS = 7;

export type AdminSessionUser = {
  id: number;
  username: string;
  displayName: string;
  mustChangePassword: number;
};

type StoredAdmin = AdminSessionUser & {
  passwordHash: string;
  passwordSalt: string;
  passwordIterations: number;
  isActive: number;
};

export async function hashPassword(
  password: string,
  saltHex = randomHex(16),
  iterations = PASSWORD_ITERATIONS,
): Promise<{ hash: string; salt: string; iterations: number }> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: hexToBytes(saltHex).buffer as ArrayBuffer, iterations },
    keyMaterial,
    256,
  );
  return { hash: bytesToHex(new Uint8Array(bits)), salt: saltHex, iterations };
}

export async function authenticateAdmin(
  usernameValue: string,
  password: string,
): Promise<{ ok: true; user: AdminSessionUser } | { ok: false; reason: "invalid" | "locked" }> {
  const username = normalizeUsername(usernameValue);
  const ip = await requestIp();
  const db = getD1();
  await db.prepare("DELETE FROM login_attempts WHERE attempted_at < datetime('now', '-1 day')").run();
  const recent = await db.prepare(`
    SELECT COUNT(*) AS count FROM login_attempts
    WHERE username = ? AND ip_address = ? AND attempted_at >= datetime('now', '-15 minutes')
  `).bind(username, ip).first<{ count: number }>();
  if ((recent?.count ?? 0) >= 5) return { ok: false, reason: "locked" };

  const admin = await db.prepare(`
    SELECT id, username, display_name AS displayName, password_hash AS passwordHash,
      password_salt AS passwordSalt, password_iterations AS passwordIterations,
      must_change_password AS mustChangePassword, is_active AS isActive
    FROM admin_users WHERE username = ? LIMIT 1
  `).bind(username).first<StoredAdmin>();

  let valid = false;
  if (admin?.isActive) {
    const candidate = await hashPassword(password, admin.passwordSalt, admin.passwordIterations);
    valid = constantTimeEqual(candidate.hash, admin.passwordHash);
  }

  if (!admin || !valid) {
    await db.prepare("INSERT INTO login_attempts (username, ip_address) VALUES (?, ?)").bind(username, ip).run();
    return { ok: false, reason: "invalid" };
  }

  await db.batch([
    db.prepare("DELETE FROM login_attempts WHERE username = ? AND ip_address = ?").bind(username, ip),
    db.prepare("UPDATE admin_users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?").bind(admin.id),
  ]);
  await createSession(admin.id);
  return {
    ok: true,
    user: {
      id: admin.id,
      username: admin.username,
      displayName: admin.displayName,
      mustChangePassword: admin.mustChangePassword,
    },
  };
}

export async function getAdminSession(): Promise<AdminSessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const tokenHash = await sha256(token);
  const now = new Date();
  const db = getD1();
  const session = await db.prepare(`
    SELECT u.id, u.username, u.display_name AS displayName,
      u.must_change_password AS mustChangePassword,
      s.id AS sessionId, s.absolute_expires_at AS absoluteExpiresAt
    FROM admin_sessions s
    JOIN admin_users u ON u.id = s.user_id
    WHERE s.token_hash = ? AND u.is_active = 1
      AND s.idle_expires_at > ? AND s.absolute_expires_at > ?
    LIMIT 1
  `).bind(tokenHash, now.toISOString(), now.toISOString()).first<AdminSessionUser & {
    sessionId: number;
    absoluteExpiresAt: string;
  }>();

  if (!session) {
    cookieStore.delete(SESSION_COOKIE);
    return null;
  }

  const idleExpiry = new Date(now.getTime() + IDLE_HOURS * 60 * 60 * 1000);
  const boundedIdle = new Date(Math.min(idleExpiry.getTime(), new Date(session.absoluteExpiresAt).getTime()));
  await db.prepare(`
    UPDATE admin_sessions SET last_seen_at = ?, idle_expires_at = ? WHERE id = ?
  `).bind(now.toISOString(), boundedIdle.toISOString(), session.sessionId).run();

  return {
    id: session.id,
    username: session.username,
    displayName: session.displayName,
    mustChangePassword: session.mustChangePassword,
  };
}

export async function requireAdmin(options: { allowPasswordChange?: boolean } = {}): Promise<AdminSessionUser> {
  const user = await getAdminSession();
  if (!user) redirect("/Demo839web/administration/connexion");
  if (user.mustChangePassword && !options.allowPasswordChange) {
    redirect("/Demo839web/administration/mot-de-passe");
  }
  return user;
}

export async function destroyAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await getD1().prepare("DELETE FROM admin_sessions WHERE token_hash = ?").bind(await sha256(token)).run();
  }
  cookieStore.delete(SESSION_COOKIE);
}

export async function assertSameOrigin(): Promise<void> {
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin");
  if (!origin) return;
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  if (!host || new URL(origin).host !== host) throw new Error("Origine de requête invalide.");
}

export async function recordAudit(
  userId: number,
  action: string,
  entityType: string,
  entityId: number | null,
  summary: string,
): Promise<void> {
  await getD1().prepare(`
    INSERT INTO audit_log (user_id, action, entity_type, entity_id, summary)
    VALUES (?, ?, ?, ?, ?)
  `).bind(userId, action, entityType, entityId, summary).run();
}

export function normalizeUsername(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "").slice(0, 40);
}

async function createSession(userId: number): Promise<void> {
  const token = randomHex(32);
  const tokenHash = await sha256(token);
  const now = new Date();
  const idleExpires = new Date(now.getTime() + IDLE_HOURS * 60 * 60 * 1000);
  const absoluteExpires = new Date(now.getTime() + ABSOLUTE_DAYS * 24 * 60 * 60 * 1000);
  await getD1().prepare(`
    INSERT INTO admin_sessions
      (user_id, token_hash, created_at, last_seen_at, idle_expires_at, absolute_expires_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(
    userId,
    tokenHash,
    now.toISOString(),
    now.toISOString(),
    idleExpires.toISOString(),
    absoluteExpires.toISOString(),
  ).run();
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: absoluteExpires,
  });
}

async function requestIp(): Promise<string> {
  const requestHeaders = await headers();
  return (
    requestHeaders.get("cf-connecting-ip") ??
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  ).slice(0, 80);
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return bytesToHex(new Uint8Array(digest));
}

function randomHex(length: number): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(value: string): Uint8Array {
  const result = new Uint8Array(value.length / 2);
  for (let index = 0; index < value.length; index += 2) {
    result[index / 2] = Number.parseInt(value.slice(index, index + 2), 16);
  }
  return result;
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let index = 0; index < a.length; index += 1) {
    difference |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return difference === 0;
}

