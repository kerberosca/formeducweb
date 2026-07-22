import type { PublicEvent } from "./calendar";
import { selectUpcomingEvents, todayInToronto } from "./calendar";
import { getDemoDatabase, type DemoDatabase } from "./sqlite";

export type CalendarYearRecord = {
  id: number;
  label: string;
  startDate: string;
  endDate: string;
  isCurrent: number;
  revision: number;
};

export type CategoryRecord = {
  id: number;
  name: string;
  slug: string;
  color: string;
  sortOrder: number;
  isActive: number;
};

export type AnnouncementRecord = {
  id: number;
  title: string;
  body: string;
  publishDate: string;
  expiresOn: string | null;
  isPinned: number;
  status: "draft" | "published" | "archived";
  createdAt: string;
  updatedAt: string;
};

export type RecurringRecord = {
  id: number;
  calendarYearId: number;
  categoryId: number | null;
  title: string;
  weekday: number;
  weekdayLabel: string;
  timeLabel: string;
  status: "draft" | "published" | "archived";
  sortOrder: number;
  categoryName: string | null;
  categoryColor: string | null;
};

export type AdminEventRecord = PublicEvent & {
  calendarYearId: number;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminUserRecord = {
  id: number;
  username: string;
  displayName: string;
  mustChangePassword: number;
  isActive: number;
  createdAt: string;
  lastLoginAt: string | null;
};

export type AuditRecord = {
  id: number;
  action: string;
  entityType: string;
  summary: string;
  createdAt: string;
  displayName: string | null;
};

export function getD1(): DemoDatabase {
  return getDemoDatabase();
}

export async function getCurrentCalendarYear(): Promise<CalendarYearRecord | null> {
  return getD1().prepare(`
    SELECT id, label, start_date AS startDate, end_date AS endDate,
      is_current AS isCurrent, revision
    FROM calendar_years
    ORDER BY is_current DESC, start_date DESC
    LIMIT 1
  `).first<CalendarYearRecord>();
}

export async function getCategories(activeOnly = true): Promise<CategoryRecord[]> {
  const result = await getD1().prepare(`
    SELECT id, name, slug, color, sort_order AS sortOrder, is_active AS isActive
    FROM categories
    ${activeOnly ? "WHERE is_active = 1" : ""}
    ORDER BY sort_order, name
  `).all<CategoryRecord>();
  return result.results;
}

export async function getPublicEvents(calendarYearId?: number): Promise<PublicEvent[]> {
  const whereYear = calendarYearId ? "AND e.calendar_year_id = ?" : "";
  const statement = getD1().prepare(`
    SELECT e.id, e.title, e.description, e.location,
      e.start_date AS startDate, e.end_date AS endDate,
      e.status, e.callout, e.cancellation_note AS cancellationNote,
      c.name AS categoryName, c.color AS categoryColor
    FROM events e
    JOIN categories c ON c.id = e.category_id
    WHERE e.status IN ('published', 'cancelled') ${whereYear}
    ORDER BY e.start_date, e.title
  `);
  const result = calendarYearId
    ? await statement.bind(calendarYearId).all<PublicEvent>()
    : await statement.all<PublicEvent>();
  return result.results;
}

export async function getUpcomingPublicEvents(): Promise<PublicEvent[]> {
  const today = todayInToronto();
  const result = await getD1().prepare(`
    SELECT e.id, e.title, e.description, e.location,
      e.start_date AS startDate, e.end_date AS endDate,
      e.status, e.callout, e.cancellation_note AS cancellationNote,
      c.name AS categoryName, c.color AS categoryColor
    FROM events e
    JOIN categories c ON c.id = e.category_id
    WHERE e.status IN ('published', 'cancelled') AND e.end_date >= ?
    ORDER BY e.start_date, e.title
  `).bind(today).all<PublicEvent>();
  return selectUpcomingEvents(result.results, today);
}

export async function getPublicAnnouncements(): Promise<AnnouncementRecord[]> {
  const today = todayInToronto();
  const result = await getD1().prepare(`
    SELECT id, title, body, publish_date AS publishDate, expires_on AS expiresOn,
      is_pinned AS isPinned, status, created_at AS createdAt, updated_at AS updatedAt
    FROM announcements
    WHERE status = 'published' AND publish_date <= ?
      AND (expires_on IS NULL OR expires_on = '' OR expires_on >= ?)
    ORDER BY is_pinned DESC, publish_date DESC, id DESC
  `).bind(today, today).all<AnnouncementRecord>();
  return result.results;
}

export async function getPublicRecurring(calendarYearId: number): Promise<RecurringRecord[]> {
  const result = await getD1().prepare(`
    SELECT r.id, r.calendar_year_id AS calendarYearId, r.category_id AS categoryId,
      r.title, r.weekday, r.weekday_label AS weekdayLabel, r.time_label AS timeLabel,
      r.status, r.sort_order AS sortOrder, c.name AS categoryName, c.color AS categoryColor
    FROM recurring_schedules r
    LEFT JOIN categories c ON c.id = r.category_id
    WHERE r.calendar_year_id = ? AND r.status = 'published'
    ORDER BY r.sort_order, r.weekday
  `).bind(calendarYearId).all<RecurringRecord>();
  return result.results;
}

export async function getAdminEvents(calendarYearId: number): Promise<AdminEventRecord[]> {
  const result = await getD1().prepare(`
    SELECT e.id, e.calendar_year_id AS calendarYearId, e.category_id AS categoryId,
      e.title, e.description, e.location, e.start_date AS startDate, e.end_date AS endDate,
      e.status, e.callout, e.cancellation_note AS cancellationNote,
      e.created_at AS createdAt, e.updated_at AS updatedAt,
      c.name AS categoryName, c.color AS categoryColor
    FROM events e JOIN categories c ON c.id = e.category_id
    WHERE e.calendar_year_id = ? AND e.status != 'archived'
    ORDER BY e.start_date, e.title
  `).bind(calendarYearId).all<AdminEventRecord>();
  return result.results;
}

export async function getAdminAnnouncements(): Promise<AnnouncementRecord[]> {
  const result = await getD1().prepare(`
    SELECT id, title, body, publish_date AS publishDate, expires_on AS expiresOn,
      is_pinned AS isPinned, status, created_at AS createdAt, updated_at AS updatedAt
    FROM announcements WHERE status != 'archived'
    ORDER BY publish_date DESC, id DESC
  `).all<AnnouncementRecord>();
  return result.results;
}

export async function getAdminAnnouncement(id: number): Promise<AnnouncementRecord | null> {
  return getD1().prepare(`
    SELECT id, title, body, publish_date AS publishDate, expires_on AS expiresOn,
      is_pinned AS isPinned, status, created_at AS createdAt, updated_at AS updatedAt
    FROM announcements WHERE id = ? LIMIT 1
  `).bind(id).first<AnnouncementRecord>();
}

export async function getAdminEvent(id: number): Promise<AdminEventRecord | null> {
  return getD1().prepare(`
    SELECT e.id, e.calendar_year_id AS calendarYearId, e.category_id AS categoryId,
      e.title, e.description, e.location, e.start_date AS startDate, e.end_date AS endDate,
      e.status, e.callout, e.cancellation_note AS cancellationNote,
      e.created_at AS createdAt, e.updated_at AS updatedAt,
      c.name AS categoryName, c.color AS categoryColor
    FROM events e JOIN categories c ON c.id = e.category_id
    WHERE e.id = ? LIMIT 1
  `).bind(id).first<AdminEventRecord>();
}

export async function getAdminRecurring(calendarYearId: number): Promise<RecurringRecord[]> {
  const result = await getD1().prepare(`
    SELECT r.id, r.calendar_year_id AS calendarYearId, r.category_id AS categoryId,
      r.title, r.weekday, r.weekday_label AS weekdayLabel, r.time_label AS timeLabel,
      r.status, r.sort_order AS sortOrder, c.name AS categoryName, c.color AS categoryColor
    FROM recurring_schedules r LEFT JOIN categories c ON c.id = r.category_id
    WHERE r.calendar_year_id = ? AND r.status != 'archived'
    ORDER BY r.sort_order, r.weekday
  `).bind(calendarYearId).all<RecurringRecord>();
  return result.results;
}

export async function getAdminUsers(): Promise<AdminUserRecord[]> {
  const result = await getD1().prepare(`
    SELECT id, username, display_name AS displayName, must_change_password AS mustChangePassword,
      is_active AS isActive, created_at AS createdAt, last_login_at AS lastLoginAt
    FROM admin_users ORDER BY is_active DESC, display_name
  `).all<AdminUserRecord>();
  return result.results;
}

export async function getRecentAudit(): Promise<AuditRecord[]> {
  const result = await getD1().prepare(`
    SELECT a.id, a.action, a.entity_type AS entityType, a.summary,
      a.created_at AS createdAt, u.display_name AS displayName
    FROM audit_log a LEFT JOIN admin_users u ON u.id = a.user_id
    ORDER BY a.created_at DESC LIMIT 12
  `).all<AuditRecord>();
  return result.results;
}

export async function safePublicData<T>(operation: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error("Lecture publique du calendrier impossible", error);
    return fallback;
  }
}

