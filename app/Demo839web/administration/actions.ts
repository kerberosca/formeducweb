"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  assertSameOrigin,
  authenticateAdmin,
  destroyAdminSession,
  hashPassword,
  normalizeUsername,
  recordAudit,
  requireAdmin,
} from "@/lib/demo839/admin-auth";
import { getD1 } from "@/lib/demo839/data";

export async function loginAction(formData: FormData): Promise<void> {
  await assertSameOrigin();
  const username = text(formData, "username");
  const password = text(formData, "password");
  const result = await authenticateAdmin(username, password);
  if (!result.ok) {
    const message = result.reason === "locked"
      ? "Trop de tentatives. Réessayez dans 15 minutes."
      : "Nom d’usager ou mot de passe invalide.";
    redirect(`/Demo839web/administration/connexion?erreur=${encodeURIComponent(message)}`);
  }
  redirect(result.user.mustChangePassword ? "/Demo839web/administration/mot-de-passe" : "/Demo839web/administration");
}

export async function logoutAction(): Promise<void> {
  await assertSameOrigin();
  await destroyAdminSession();
  redirect("/Demo839web/administration/connexion");
}

export async function changeOwnPasswordAction(formData: FormData): Promise<void> {
  await assertSameOrigin();
  const user = await requireAdmin({ allowPasswordChange: true });
  const password = text(formData, "password");
  const confirmation = text(formData, "confirmation");
  if (password.length < 12 || password !== confirmation) {
    redirect("/Demo839web/administration/mot-de-passe?erreur=Le+mot+de+passe+doit+contenir+12+caractères+et+les+deux+valeurs+doivent+être+identiques.");
  }
  const value = await hashPassword(password);
  const db = getD1();
  await db.batch([
    db.prepare(`
      UPDATE admin_users SET password_hash = ?, password_salt = ?, password_iterations = ?,
        must_change_password = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(value.hash, value.salt, value.iterations, user.id),
    db.prepare("DELETE FROM admin_sessions WHERE user_id = ?").bind(user.id),
  ]);
  await recordAudit(user.id, "password_changed", "admin_user", user.id, "Mot de passe modifié");
  await destroyAdminSession();
  redirect("/Demo839web/administration/connexion?message=Mot+de+passe+modifié.+Reconnectez-vous.");
}

export async function createAnnouncementAction(formData: FormData): Promise<void> {
  const user = await authorizedMutation();
  const title = required(formData, "title", 120);
  const body = required(formData, "body", 4000);
  const publishDate = isoDate(formData, "publishDate");
  const expiresOn = optionalIsoDate(formData, "expiresOn");
  const status = announcementStatus(text(formData, "status"));
  const pinned = formData.get("isPinned") ? 1 : 0;
  const result = await getD1().prepare(`
    INSERT INTO announcements
      (title, body, publish_date, expires_on, is_pinned, status, created_by, updated_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(title, body, publishDate, expiresOn, pinned, status, user.id, user.id).run();
  await recordAudit(user.id, "created", "announcement", Number(result.meta.last_row_id), `Annonce « ${title} » créée`);
  refreshPublic();
  redirect("/Demo839web/administration?message=Annonce+enregistrée#annonces");
}

export async function updateAnnouncementAction(formData: FormData): Promise<void> {
  const user = await authorizedMutation();
  const id = integer(formData, "id");
  const title = required(formData, "title", 120);
  const body = required(formData, "body", 4000);
  const publishDate = isoDate(formData, "publishDate");
  const expiresOn = optionalIsoDate(formData, "expiresOn");
  const status = announcementStatus(text(formData, "status"));
  const pinned = formData.get("isPinned") ? 1 : 0;
  await getD1().prepare(`
    UPDATE announcements SET title = ?, body = ?, publish_date = ?, expires_on = ?,
      is_pinned = ?, status = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(title, body, publishDate, expiresOn, pinned, status, user.id, id).run();
  await recordAudit(user.id, "updated", "announcement", id, `Annonce « ${title} » modifiée`);
  refreshPublic();
  redirect("/Demo839web/administration?message=Annonce+mise+à+jour#annonces");
}

export async function setAnnouncementStatusAction(formData: FormData): Promise<void> {
  const user = await authorizedMutation();
  const id = integer(formData, "id");
  const status = announcementStatus(text(formData, "status"));
  await getD1().prepare(`
    UPDATE announcements SET status = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `).bind(status, user.id, id).run();
  await recordAudit(user.id, status, "announcement", id, `Annonce passée à l’état ${status}`);
  refreshPublic();
  redirect("/Demo839web/administration#annonces");
}

export async function createEventAction(formData: FormData): Promise<void> {
  const user = await authorizedMutation();
  const calendarYearId = integer(formData, "calendarYearId");
  const categoryId = integer(formData, "categoryId");
  const title = required(formData, "title", 140);
  const description = text(formData, "description").slice(0, 3000);
  const location = text(formData, "location").slice(0, 160);
  const startDate = isoDate(formData, "startDate");
  const endDate = isoDate(formData, "endDate");
  if (endDate < startDate) throw new Error("La date de fin doit suivre la date de début.");
  const status = eventStatus(text(formData, "status"));
  const callout = eventCallout(text(formData, "callout"));
  const cancellationNote = text(formData, "cancellationNote").slice(0, 500);
  const db = getD1();
  const result = await db.prepare(`
    INSERT INTO events
      (calendar_year_id, category_id, title, description, location, start_date, end_date,
       status, callout, cancellation_note, created_by, updated_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    calendarYearId, categoryId, title, description, location, startDate, endDate,
    status, callout, cancellationNote, user.id, user.id,
  ).run();
  if (status === "published" || status === "cancelled") await bumpRevision(calendarYearId);
  await recordAudit(user.id, "created", "event", Number(result.meta.last_row_id), `Activité « ${title} » créée`);
  refreshPublic();
  redirect("/Demo839web/administration?message=Activité+enregistrée#activites");
}

export async function updateEventAction(formData: FormData): Promise<void> {
  const user = await authorizedMutation();
  const id = integer(formData, "id");
  const calendarYearId = integer(formData, "calendarYearId");
  const categoryId = integer(formData, "categoryId");
  const title = required(formData, "title", 140);
  const description = text(formData, "description").slice(0, 3000);
  const location = text(formData, "location").slice(0, 160);
  const startDate = isoDate(formData, "startDate");
  const endDate = isoDate(formData, "endDate");
  if (endDate < startDate) throw new Error("La date de fin doit suivre la date de début.");
  const status = eventStatus(text(formData, "status"));
  const callout = eventCallout(text(formData, "callout"));
  const cancellationNote = text(formData, "cancellationNote").slice(0, 500);
  await getD1().prepare(`
    UPDATE events SET category_id = ?, title = ?, description = ?, location = ?,
      start_date = ?, end_date = ?, status = ?, callout = ?, cancellation_note = ?,
      updated_by = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `).bind(
    categoryId, title, description, location, startDate, endDate, status,
    callout, cancellationNote, user.id, id,
  ).run();
  if (status === "published" || status === "cancelled") await bumpRevision(calendarYearId);
  await recordAudit(user.id, "updated", "event", id, `Activité « ${title} » modifiée`);
  refreshPublic();
  redirect("/Demo839web/administration?message=Activité+mise+à+jour#activites");
}

export async function setEventStatusAction(formData: FormData): Promise<void> {
  const user = await authorizedMutation();
  const id = integer(formData, "id");
  const calendarYearId = integer(formData, "calendarYearId");
  const status = eventStatus(text(formData, "status"));
  const db = getD1();
  const before = await db.prepare("SELECT status, title FROM events WHERE id = ?").bind(id).first<{ status: string; title: string }>();
  await db.prepare(`
    UPDATE events SET status = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `).bind(status, user.id, id).run();
  if (before?.status === "published" || before?.status === "cancelled" || status === "published" || status === "cancelled") {
    await bumpRevision(calendarYearId);
  }
  await recordAudit(user.id, status, "event", id, `Activité « ${before?.title ?? id} » passée à l’état ${status}`);
  refreshPublic();
  redirect("/Demo839web/administration#activites");
}

export async function createRecurringAction(formData: FormData): Promise<void> {
  const user = await authorizedMutation();
  const calendarYearId = integer(formData, "calendarYearId");
  const categoryId = optionalInteger(formData, "categoryId");
  const title = required(formData, "title", 120);
  const weekday = integer(formData, "weekday");
  const weekdayLabel = required(formData, "weekdayLabel", 30);
  const timeLabel = text(formData, "timeLabel").slice(0, 80);
  const status = scheduleStatus(text(formData, "status"));
  const result = await getD1().prepare(`
    INSERT INTO recurring_schedules
      (calendar_year_id, category_id, title, weekday, weekday_label, time_label, status, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(calendarYearId, categoryId, title, weekday, weekdayLabel, timeLabel, status, weekday).run();
  if (status === "published") await bumpRevision(calendarYearId);
  await recordAudit(user.id, "created", "recurring_schedule", Number(result.meta.last_row_id), `Horaire « ${title} » créé`);
  refreshPublic();
  redirect("/Demo839web/administration?message=Horaire+enregistré#horaire");
}

export async function setRecurringStatusAction(formData: FormData): Promise<void> {
  const user = await authorizedMutation();
  const id = integer(formData, "id");
  const calendarYearId = integer(formData, "calendarYearId");
  const status = scheduleStatus(text(formData, "status"));
  await getD1().prepare(`
    UPDATE recurring_schedules SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `).bind(status, id).run();
  await bumpRevision(calendarYearId);
  await recordAudit(user.id, status, "recurring_schedule", id, `Horaire passé à l’état ${status}`);
  refreshPublic();
  redirect("/Demo839web/administration#horaire");
}

export async function createCategoryAction(formData: FormData): Promise<void> {
  const user = await authorizedMutation();
  const name = required(formData, "name", 60);
  const slug = normalizeUsername(required(formData, "slug", 60));
  const color = text(formData, "color");
  if (!/^#[0-9a-f]{6}$/i.test(color)) throw new Error("Couleur invalide.");
  const result = await getD1().prepare(`
    INSERT INTO categories (name, slug, color, sort_order) VALUES (?, ?, ?, 50)
  `).bind(name, slug, color).run();
  await recordAudit(user.id, "created", "category", Number(result.meta.last_row_id), `Catégorie « ${name} » créée`);
  revalidatePath("/Demo839web/administration");
  redirect("/Demo839web/administration?message=Catégorie+créée#categories");
}

export async function createAdminAction(formData: FormData): Promise<void> {
  const user = await authorizedMutation();
  const username = normalizeUsername(required(formData, "username", 40));
  const displayName = required(formData, "displayName", 80);
  const password = required(formData, "password", 200);
  if (username.length < 3 || password.length < 12) throw new Error("Nom d’usager ou mot de passe trop court.");
  const value = await hashPassword(password);
  const result = await getD1().prepare(`
    INSERT INTO admin_users
      (username, display_name, password_hash, password_salt, password_iterations, must_change_password)
    VALUES (?, ?, ?, ?, ?, 1)
  `).bind(username, displayName, value.hash, value.salt, value.iterations).run();
  await recordAudit(user.id, "created", "admin_user", Number(result.meta.last_row_id), `Compte « ${username} » créé`);
  revalidatePath("/Demo839web/administration/comptes");
  redirect("/Demo839web/administration/comptes?message=Compte+créé");
}

export async function resetAdminPasswordAction(formData: FormData): Promise<void> {
  const user = await authorizedMutation();
  const id = integer(formData, "id");
  const password = required(formData, "password", 200);
  if (password.length < 12) throw new Error("Le mot de passe temporaire doit contenir 12 caractères.");
  const value = await hashPassword(password);
  const db = getD1();
  await db.batch([
    db.prepare(`
      UPDATE admin_users SET password_hash = ?, password_salt = ?, password_iterations = ?,
        must_change_password = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(value.hash, value.salt, value.iterations, id),
    db.prepare("DELETE FROM admin_sessions WHERE user_id = ?").bind(id),
  ]);
  await recordAudit(user.id, "password_reset", "admin_user", id, "Mot de passe temporaire attribué");
  revalidatePath("/Demo839web/administration/comptes");
  redirect("/Demo839web/administration/comptes?message=Mot+de+passe+réinitialisé");
}

export async function toggleAdminAction(formData: FormData): Promise<void> {
  const user = await authorizedMutation();
  const id = integer(formData, "id");
  const activate = text(formData, "activate") === "1";
  const db = getD1();
  if (!activate) {
    const active = await db.prepare("SELECT COUNT(*) AS count FROM admin_users WHERE is_active = 1").first<{ count: number }>();
    if ((active?.count ?? 0) <= 1) throw new Error("Le dernier administrateur actif ne peut pas être désactivé.");
  }
  await db.batch([
    db.prepare("UPDATE admin_users SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(activate ? 1 : 0, id),
    db.prepare("DELETE FROM admin_sessions WHERE user_id = ?").bind(id),
  ]);
  await recordAudit(user.id, activate ? "activated" : "deactivated", "admin_user", id, activate ? "Compte activé" : "Compte désactivé");
  revalidatePath("/Demo839web/administration/comptes");
  redirect("/Demo839web/administration/comptes");
}

async function authorizedMutation() {
  await assertSameOrigin();
  return requireAdmin();
}

async function bumpRevision(calendarYearId: number): Promise<void> {
  await getD1().prepare(`
    UPDATE calendar_years SET revision = revision + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `).bind(calendarYearId).run();
}

function refreshPublic(): void {
  revalidatePath("/Demo839web");
  revalidatePath("/Demo839web/communications");
  revalidatePath("/Demo839web/communications/imprimer");
  revalidatePath("/Demo839web/administration");
}

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function required(formData: FormData, key: string, max: number): string {
  const value = text(formData, key).slice(0, max);
  if (!value) throw new Error(`Le champ ${key} est obligatoire.`);
  return value;
}

function integer(formData: FormData, key: string): number {
  const value = Number.parseInt(text(formData, key), 10);
  if (!Number.isInteger(value)) throw new Error(`Le champ ${key} est invalide.`);
  return value;
}

function optionalInteger(formData: FormData, key: string): number | null {
  const value = text(formData, key);
  return value ? integer(formData, key) : null;
}

function isoDate(formData: FormData, key: string): string {
  const value = text(formData, key);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error(`La date ${key} est invalide.`);
  return value;
}

function optionalIsoDate(formData: FormData, key: string): string | null {
  const value = text(formData, key);
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error(`La date ${key} est invalide.`);
  return value;
}

function eventStatus(value: string): "draft" | "published" | "cancelled" | "archived" {
  if (["draft", "published", "cancelled", "archived"].includes(value)) return value as "draft" | "published" | "cancelled" | "archived";
  throw new Error("État d’activité invalide.");
}

function announcementStatus(value: string): "draft" | "published" | "archived" {
  if (["draft", "published", "archived"].includes(value)) return value as "draft" | "published" | "archived";
  throw new Error("État d’annonce invalide.");
}

function scheduleStatus(value: string): "draft" | "published" | "archived" {
  return announcementStatus(value);
}

function eventCallout(value: string): "standard" | "parade_month" | "parade_commandant" {
  if (["standard", "parade_month", "parade_commandant"].includes(value)) return value as "standard" | "parade_month" | "parade_commandant";
  throw new Error("Type d’activité invalide.");
}

