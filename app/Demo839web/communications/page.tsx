import type { Metadata } from "next";
import Link from "next/link";
import {
  EmptyEvents,
  EventCard,
  MonthCalendar,
  SectionHeading,
  SiteFooter,
  SiteHeader,
} from "@/components/demo839/site";
import { ACADEMIC_MONTHS, formatLongDate, parseAcademicStartYear, todayInToronto } from "@/lib/demo839/calendar";
import {
  getCategories,
  getCurrentCalendarYear,
  getPublicAnnouncements,
  getPublicEvents,
  getPublicRecurring,
  getUpcomingPublicEvents,
  safePublicData,
} from "@/lib/demo839/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Communications et calendrier",
  description: "Annonces, activités et calendrier public de l’Escadron 839 Lions de Chibougamau.",
};

export default async function CommunicationsPage() {
  const year = await safePublicData(getCurrentCalendarYear, null);
  const [announcements, upcoming, categories, events, recurring] = await Promise.all([
    safePublicData(getPublicAnnouncements, []),
    safePublicData(getUpcomingPublicEvents, []),
    safePublicData(() => getCategories(true), []),
    safePublicData(() => getPublicEvents(year?.id), []),
    year ? safePublicData(() => getPublicRecurring(year.id), []) : Promise.resolve([]),
  ]);
  const startYear = parseAcademicStartYear(year?.label ?? "2026–2027");
  const today = todayInToronto();
  const pinned = announcements.filter((item) => item.isPinned);
  const current = announcements.filter((item) => !item.isPinned);

  return (
    <main>
      <a className="skip-link" href="#contenu">Aller au contenu</a>
      <SiteHeader active="communications" />

      <header className="page-hero page-hero--communications" id="contenu">
        <div className="container page-hero__layout">
          <div><p className="eyebrow eyebrow--light">Le point de repère des familles</p><h1>Communications<br />et calendrier.</h1></div>
          <div className="page-hero__aside">
            <p>Retrouvez ici les annonces importantes, les activités à venir et l’horaire annuel de l’Escadron 839.</p>
            <p className="today-label">Mis à jour · {formatLongDate(today)}</p>
          </div>
        </div>
      </header>

      {pinned.length > 0 && (
        <section className="pinned-notices" aria-label="Annonces importantes">
          <div className="container pinned-notices__list">
            {pinned.map((announcement) => (
              <article key={announcement.id}><span>Important</span><div><h2>{announcement.title}</h2><p>{announcement.body}</p></div></article>
            ))}
          </div>
        </section>
      )}

      <section className="section section--upcoming" id="activites">
        <div className="container">
          <SectionHeading eyebrow="À l’agenda" title="Les activités à venir.">
            <p>Les activités des 30 prochains jours, ou les deux prochaines dates lorsqu’il n’y en a aucune dans cette période.</p>
          </SectionHeading>
          <div className="events-list">
            {upcoming.length > 0 ? upcoming.map((event) => <EventCard key={event.id} event={event} />) : <EmptyEvents />}
          </div>
        </div>
      </section>

      <section className="section section--announcements" id="annonces">
        <div className="container announcements-layout">
          <div><p className="eyebrow">Nouvelles de l’escadron</p><h2>Annonces.</h2><p>Les messages expirés sont retirés automatiquement afin que cette page demeure facile à consulter.</p></div>
          <div className="announcement-list">
            {current.length > 0 ? current.map((announcement) => (
              <article key={announcement.id}>
                <time dateTime={announcement.publishDate}>{formatLongDate(announcement.publishDate)}</time>
                <h3>{announcement.title}</h3>
                <p>{announcement.body}</p>
              </article>
            )) : <div className="empty-state"><span aria-hidden="true">✦</span><p><strong>Aucune nouvelle annonce.</strong> Les messages importants seront publiés ici.</p></div>}
          </div>
        </div>
      </section>

      <section className="section section--schedule" id="horaire">
        <div className="container schedule-layout">
          <div><p className="eyebrow eyebrow--light">Rendez-vous réguliers</p><h2>Notre semaine.</h2><p>L’horaire régulier est présenté séparément des événements spéciaux.</p></div>
          <div className="schedule-list">
            {recurring.length > 0 ? recurring.map((item) => (
              <article key={item.id}><span style={{ backgroundColor: item.categoryColor ?? "#b6d5dc" }} /><div><strong>{item.title}</strong><small>{item.weekdayLabel}{item.timeLabel ? ` · ${item.timeLabel}` : ""}</small></div></article>
            )) : <div className="empty-state empty-state--dark"><p>L’horaire régulier sera publié ici prochainement.</p></div>}
          </div>
        </div>
      </section>

      <section className="section section--full-calendar" id="calendrier">
        <div className="container">
          <SectionHeading eyebrow="Année d’instruction" title={`Calendrier ${year?.label ?? "2026–2027"}.`}>
            <Link className="button" href="/Demo839web/communications/imprimer">Version imprimable</Link>
          </SectionHeading>
          <div className="legend" aria-label="Légende du calendrier">
            {categories.map((category) => <span key={category.id}><i style={{ backgroundColor: category.color }} />{category.name}</span>)}
          </div>
          <div className="calendar-months">
            {ACADEMIC_MONTHS.map((item) => (
              <MonthCalendar
                key={`${item.yearOffset}-${item.month}`}
                year={startYear + item.yearOffset}
                month={item.month}
                label={item.label}
                events={events}
              />
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

