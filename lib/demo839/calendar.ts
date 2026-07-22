export type EventStatus = "draft" | "published" | "cancelled" | "archived";

export type PublicEvent = {
  id: number;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  status: EventStatus;
  callout: "standard" | "parade_month" | "parade_commandant";
  cancellationNote: string;
  categoryName: string;
  categoryColor: string;
};

export type CalendarCell = {
  date: string;
  day: number;
  isCurrentMonth: boolean;
};

export const ACADEMIC_MONTHS = [
  { yearOffset: 0, month: 8, label: "Septembre" },
  { yearOffset: 0, month: 9, label: "Octobre" },
  { yearOffset: 0, month: 10, label: "Novembre" },
  { yearOffset: 0, month: 11, label: "Décembre" },
  { yearOffset: 1, month: 0, label: "Janvier" },
  { yearOffset: 1, month: 1, label: "Février" },
  { yearOffset: 1, month: 2, label: "Mars" },
  { yearOffset: 1, month: 3, label: "Avril" },
  { yearOffset: 1, month: 4, label: "Mai" },
  { yearOffset: 1, month: 5, label: "Juin" },
] as const;

const DATE_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Toronto",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function todayInToronto(now = new Date()): string {
  return DATE_FORMATTER.format(now);
}

export function addDays(date: string, amount: number): string {
  const [year, month, day] = date.split("-").map(Number);
  const value = new Date(Date.UTC(year, month - 1, day + amount));
  return `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, "0")}-${String(value.getUTCDate()).padStart(2, "0")}`;
}

export function selectUpcomingEvents(
  events: PublicEvent[],
  today: string,
  windowDays = 30,
): PublicEvent[] {
  const windowEnd = addDays(today, windowDays);
  const eligible = events
    .filter((event) => event.status === "published" || event.status === "cancelled")
    .filter((event) => event.endDate >= today)
    .sort(compareEvents);
  const inWindow = eligible.filter(
    (event) => event.startDate <= windowEnd && event.endDate >= today,
  );
  const activeInWindow = inWindow.filter((event) => event.status === "published");

  if (activeInWindow.length > 0) return inWindow;

  const fallback = eligible
    .filter((event) => event.status === "published" && event.startDate > windowEnd)
    .slice(0, 2);
  return [...inWindow, ...fallback].sort(compareEvents);
}

export function buildMonthCells(year: number, month: number): CalendarCell[] {
  const first = new Date(Date.UTC(year, month, 1));
  const mondayOffset = (first.getUTCDay() + 6) % 7;
  const start = new Date(Date.UTC(year, month, 1 - mondayOffset));

  return Array.from({ length: 42 }, (_, index) => {
    const current = new Date(start);
    current.setUTCDate(start.getUTCDate() + index);
    return {
      date: `${current.getUTCFullYear()}-${String(current.getUTCMonth() + 1).padStart(2, "0")}-${String(current.getUTCDate()).padStart(2, "0")}`,
      day: current.getUTCDate(),
      isCurrentMonth: current.getUTCMonth() === month,
    };
  });
}

export function eventsOnDate(events: PublicEvent[], date: string): PublicEvent[] {
  return events.filter(
    (event) => event.startDate <= date && event.endDate >= date && event.status !== "archived",
  );
}

export function formatEventDate(startDate: string, endDate: string): string {
  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);
  const dayMonth = new Intl.DateTimeFormat("fr-CA", { day: "numeric", month: "long", timeZone: "UTC" });
  const dayOnly = new Intl.DateTimeFormat("fr-CA", { day: "numeric", timeZone: "UTC" });

  if (startDate === endDate) return dayMonth.format(start);
  if (startDate.slice(0, 7) === endDate.slice(0, 7)) {
    return `${dayOnly.format(start)} au ${dayMonth.format(end)}`;
  }
  return `${dayMonth.format(start)} au ${dayMonth.format(end)}`;
}

export function formatLongDate(date: string): string {
  return new Intl.DateTimeFormat("fr-CA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(parseLocalDate(date));
}

export function parseAcademicStartYear(label: string): number {
  const match = label.match(/\d{4}/);
  return match ? Number(match[0]) : new Date().getFullYear();
}

function parseLocalDate(date: string): Date {
  return new Date(`${date}T12:00:00Z`);
}

function compareEvents(a: PublicEvent, b: PublicEvent): number {
  return a.startDate.localeCompare(b.startDate) || a.title.localeCompare(b.title, "fr");
}

