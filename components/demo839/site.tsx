import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import {
  buildMonthCells,
  eventsOnDate,
  formatEventDate,
  type PublicEvent,
} from "@/lib/demo839/calendar";

export function SiteHeader({ active }: { active?: "accueil" | "communications" }) {
  return (
    <header className="site-header">
      <div className="container nav-shell">
        <Link className="brand" href="/Demo839web" aria-label="Accueil — Escadron 839">
          <span className="brand-logo"><img src="/Demo839web/logo-couleur.png" alt="" /></span>
          <span className="brand-copy"><strong>Escadron 839</strong><small>Lions de Chibougamau</small></span>
        </Link>
        <nav aria-label="Navigation principale">
          <Link className={active === "accueil" ? "is-active" : ""} href="/Demo839web/#escadron">L’escadron</Link>
          <Link href="/Demo839web/#activites">Activités</Link>
          <Link className={active === "communications" ? "is-active" : ""} href="/Demo839web/communications">Communications</Link>
          <Link href="/Demo839web/#parents">Parents</Link>
          <Link href="/Demo839web/#contact">Contact</Link>
        </nav>
        <a className="button button--compact" href="https://registration.cadets.gc.ca/" target="_blank" rel="noreferrer">
          S’inscrire <span aria-hidden="true">↗</span>
        </a>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer" id="contact">
      <div className="container footer-grid">
        <div>
          <Link className="brand brand--footer" href="/Demo839web">
            <span className="brand-logo"><img src="/Demo839web/logo-couleur.png" alt="" /></span>
            <span className="brand-copy"><strong>Escadron 839</strong><small>Lions de Chibougamau</small></span>
          </Link>
          <p className="footer-note">Un point de repère pour les jeunes, les parents et toute la communauté de l’escadron.</p>
        </div>
        <div>
          <h2>Nous joindre</h2>
          <a href="mailto:839Aviation@cadets.gc.ca">839Aviation@cadets.gc.ca</a>
          <p>265, rue Lanctôt<br />Chibougamau (Québec)</p>
        </div>
        <div>
          <h2>Liens utiles</h2>
          <Link href="/Demo839web/communications">Communications et calendrier</Link>
          <a href="https://839aviation.cadets.site/" target="_blank" rel="noreferrer">Fiche officielle du 839 ↗</a>
          <a href="https://registration.cadets.gc.ca/" target="_blank" rel="noreferrer">Inscription en ligne ↗</a>
          <Link className="admin-link" href="/Demo839web/administration/connexion">Administration</Link>
        </div>
      </div>
      <div className="container footer-bottom"><span>© 2026 · Escadron 839 Lions de Chibougamau</span><span>Programme des cadets de l’Aviation royale du Canada</span></div>
    </footer>
  );
}

export function EventCard({ event, compact = false }: { event: PublicEvent; compact?: boolean }) {
  const colorStyle = { "--event-color": event.categoryColor } as CSSProperties;
  return (
    <article className={`event-card ${event.status === "cancelled" ? "is-cancelled" : ""} ${compact ? "event-card--compact" : ""}`} style={colorStyle}>
      <div className="event-card__date">{formatEventDate(event.startDate, event.endDate)}</div>
      <div className="event-card__body">
        <div className="event-card__meta">
          <span className="category-dot" />
          <span>{event.categoryName}</span>
          {event.status === "cancelled" && <strong>Annulée</strong>}
        </div>
        <h3>{event.title}</h3>
        {!compact && event.description && <p>{event.description}</p>}
        {!compact && event.location && <small>{event.location}</small>}
        {event.status === "cancelled" && event.cancellationNote && <p className="cancel-note">{event.cancellationNote}</p>}
      </div>
    </article>
  );
}

export function EmptyEvents() {
  return (
    <div className="empty-state">
      <span aria-hidden="true">✦</span>
      <p><strong>Aucune activité annoncée pour le moment.</strong> Revenez bientôt pour les prochaines dates.</p>
    </div>
  );
}

export function MonthCalendar({
  year,
  month,
  label,
  events,
  print = false,
}: {
  year: number;
  month: number;
  label: string;
  events: PublicEvent[];
  print?: boolean;
}) {
  const cells = buildMonthCells(year, month);
  return (
    <section className={`month-card ${print ? "month-card--print" : ""}`} aria-label={`${label} ${year}`}>
      <header><strong>{label}</strong><span>{year}</span></header>
      <div className="month-weekdays" aria-hidden="true">
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}
      </div>
      <div className="month-days">
        {cells.map((cell) => {
          const dayEvents = eventsOnDate(events, cell.date);
          const primary = dayEvents[0];
          const style = primary ? { "--day-color": primary.categoryColor } as CSSProperties : undefined;
          const title = dayEvents.map((event) => `${event.title}${event.status === "cancelled" ? " — Annulée" : ""}`).join("; ");
          return (
            <div
              className={`month-day ${cell.isCurrentMonth ? "" : "is-outside"} ${primary ? "has-event" : ""} ${primary?.status === "cancelled" ? "is-cancelled" : ""}`}
              style={style}
              key={cell.date}
              title={title || undefined}
            >
              <span>{cell.day}</span>
              {!print && dayEvents.length > 0 && (
                <div className="day-markers" aria-label={title}>
                  {dayEvents.slice(0, 3).map((event) => (
                    <i key={event.id} style={{ backgroundColor: event.categoryColor }} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function SectionHeading({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="section-heading">
      <div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>
      {children && <div className="section-heading__aside">{children}</div>}
    </div>
  );
}

