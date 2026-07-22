import type { Metadata } from "next";
import { MonthCalendar } from "@/components/demo839/site";
import { PrintButton } from "@/components/demo839/print-button";
import { ACADEMIC_MONTHS, formatEventDate, parseAcademicStartYear } from "@/lib/demo839/calendar";
import {
  getCategories,
  getCurrentCalendarYear,
  getPublicEvents,
  getPublicRecurring,
  safePublicData,
} from "@/lib/demo839/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Calendrier imprimable",
  description: "Calendrier annuel imprimable de l’Escadron 839.",
};

export default async function PrintableCalendarPage() {
  const year = await safePublicData(getCurrentCalendarYear, null);
  const [events, categories, recurring] = await Promise.all([
    safePublicData(() => getPublicEvents(year?.id), []),
    safePublicData(() => getCategories(true), []),
    year ? safePublicData(() => getPublicRecurring(year.id), []) : Promise.resolve([]),
  ]);
  const label = year?.label ?? "2026–2027";
  const startYear = parseAcademicStartYear(label);
  const pages = [ACADEMIC_MONTHS.slice(0, 4), ACADEMIC_MONTHS.slice(4)];

  return (
    <main className="print-root">
      <div className="print-toolbar">
        <a href="/Demo839web/communications">← Retour aux communications</a>
        <PrintButton />
      </div>
      {pages.map((months, pageIndex) => {
        const pageEvents = events.filter((event) => months.some((month) => {
          const monthKey = `${startYear + month.yearOffset}-${String(month.month + 1).padStart(2, "0")}`;
          return event.startDate.startsWith(monthKey);
        }));
        return (
          <article className="print-sheet" key={pageIndex}>
            <header className="print-header">
              <img src="/Demo839web/logo-couleur.png" alt="Logo de l’Escadron 839" />
              <div><span>Escadron 839</span><h1>Lions de Chibougamau</h1><p>Calendrier {label}</p></div>
              <strong>Version {String(year?.revision ?? 0).padStart(2, "0")}</strong>
            </header>

            <div className={`print-months print-months--${months.length}`}>
              {months.map((item) => <MonthCalendar key={`${item.yearOffset}-${item.month}`} year={startYear + item.yearOffset} month={item.month} label={item.label} events={events} print />)}
            </div>

            <div className="print-info-row">
              <div className="print-legend">
                <h2>Légende</h2>
                {categories.map((category) => <span key={category.id}><i style={{ backgroundColor: category.color }} />{category.name}</span>)}
              </div>
              <div className="print-recurring">
                <h2>Horaire régulier</h2>
                {recurring.length > 0 ? recurring.map((item) => <span key={item.id}><strong>{item.title}</strong>{item.weekdayLabel}{item.timeLabel ? ` · ${item.timeLabel}` : ""}</span>) : <span>À confirmer</span>}
              </div>
            </div>

            <div className="print-events">
              {months.map((month) => {
                const monthKey = `${startYear + month.yearOffset}-${String(month.month + 1).padStart(2, "0")}`;
                const monthEvents = pageEvents.filter((event) => event.startDate.startsWith(monthKey));
                return (
                  <section key={monthKey}>
                    <h2>{month.label}</h2>
                    {monthEvents.length > 0 ? monthEvents.map((event) => (
                      <div key={event.id} className={event.status === "cancelled" ? "is-cancelled" : ""}>
                        <span style={{ borderLeftColor: event.categoryColor }}>{formatEventDate(event.startDate, event.endDate)}</span>
                        <strong>{event.title}{event.status === "cancelled" ? " — ANNULÉE" : ""}</strong>
                      </div>
                    )) : <p>—</p>}
                  </section>
                );
              })}
            </div>
            <footer className="print-footer"><span>839Aviation@cadets.gc.ca</span><span>265, rue Lanctôt · Chibougamau</span></footer>
          </article>
        );
      })}
    </main>
  );
}

