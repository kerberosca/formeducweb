import Link from "next/link";
import { AdminNotice, AdminShell, AnnouncementForm, EventForm, StatusBadge } from "@/components/demo839/admin";
import { formatEventDate, todayInToronto } from "@/lib/demo839/calendar";
import { requireAdmin } from "@/lib/demo839/admin-auth";
import {
  getAdminAnnouncements,
  getAdminEvents,
  getAdminRecurring,
  getCategories,
  getCurrentCalendarYear,
  getRecentAudit,
} from "@/lib/demo839/data";
import {
  createCategoryAction,
  createRecurringAction,
  setAnnouncementStatusAction,
  setEventStatusAction,
  setRecurringStatusAction,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ message?: string; erreur?: string }> }) {
  const user = await requireAdmin();
  const year = await getCurrentCalendarYear();
  if (!year) throw new Error("Aucune année d’instruction n’est configurée.");
  const [announcements, events, recurring, categories, audit, params] = await Promise.all([
    getAdminAnnouncements(),
    getAdminEvents(year.id),
    getAdminRecurring(year.id),
    getCategories(false),
    getRecentAudit(),
    searchParams,
  ]);
  const today = todayInToronto();
  const publicEvents = events.filter((item) => item.status === "published" || item.status === "cancelled");

  return (
    <AdminShell user={user}>
      <div className="admin-main">
        <AdminNotice message={params.message} error={params.erreur} />
        <div className="admin-public-warning"><strong>Publication publique</strong><p>Tout contenu enregistré avec l’état « Publié » ou « Annulée » devient immédiatement visible aux cadets, aux parents et au public. N’inscrivez aucun renseignement personnel.</p></div>

        <header className="admin-title-row">
          <div><p className="eyebrow">Tableau de bord</p><h1>Communications {year.label}</h1><p>Version imprimable {String(year.revision).padStart(2, "0")}</p></div>
          <div><Link className="button button--secondary" href="/Demo839web/communications" target="_blank">Aperçu public ↗</Link><Link className="button" href="/Demo839web/communications/imprimer" target="_blank">Aperçu imprimable ↗</Link></div>
        </header>

        <section className="admin-stats" aria-label="Résumé">
          <article><span>{announcements.filter((item) => item.status === "published").length}</span><p>Annonces publiées</p></article>
          <article><span>{publicEvents.length}</span><p>Activités publiques</p></article>
          <article><span>{events.filter((item) => item.status === "draft").length}</span><p>Brouillons à valider</p></article>
          <article><span>{events.filter((item) => item.endDate >= today).length}</span><p>Activités futures</p></article>
        </section>

        <section className="admin-section" id="annonces">
          <div className="admin-section__heading"><div><p className="eyebrow">Messages publics</p><h2>Annonces</h2></div><span>{announcements.length} annonce{announcements.length !== 1 ? "s" : ""}</span></div>
          <details className="admin-create" open={announcements.length === 0}>
            <summary>Ajouter une annonce</summary>
            <AnnouncementForm />
          </details>
          <div className="admin-table-wrap">
            <table className="admin-table"><thead><tr><th>Annonce</th><th>Publication</th><th>État</th><th>Actions</th></tr></thead><tbody>
              {announcements.map((item) => <tr key={item.id}><td><strong>{item.title}</strong>{item.isPinned ? <small>Épinglée</small> : null}</td><td>{item.publishDate}{item.expiresOn ? <small>Expire le {item.expiresOn}</small> : null}</td><td><StatusBadge status={item.status} /></td><td className="table-actions"><Link href={`/Demo839web/administration/annonces/${item.id}`}>Modifier</Link>{item.status !== "published" && <StatusForm action={setAnnouncementStatusAction} id={item.id} status="published" label="Publier" />}{item.status !== "archived" && <StatusForm action={setAnnouncementStatusAction} id={item.id} status="archived" label="Archiver" />}</td></tr>)}
              {announcements.length === 0 && <tr><td colSpan={4}>Aucune annonce. Utilisez le formulaire ci-dessus pour publier le premier message.</td></tr>}
            </tbody></table>
          </div>
        </section>

        <section className="admin-section" id="activites">
          <div className="admin-section__heading"><div><p className="eyebrow">Calendrier annuel</p><h2>Activités</h2></div><span>{events.length} activité{events.length !== 1 ? "s" : ""}</span></div>
          <details className="admin-create">
            <summary>Ajouter une activité</summary>
            <EventForm year={year} categories={categories.filter((item) => item.isActive)} />
          </details>
          <div className="admin-table-wrap admin-table-wrap--tall">
            <table className="admin-table"><thead><tr><th>Date</th><th>Activité</th><th>Catégorie</th><th>État</th><th>Actions</th></tr></thead><tbody>
              {events.map((event) => <tr key={event.id}><td>{formatEventDate(event.startDate, event.endDate)}</td><td><strong>{event.title}</strong>{event.callout !== "standard" && <small>{event.callout === "parade_month" ? "Parade du mois" : "Parade du commandant"}</small>}</td><td><span className="category-label"><i style={{ backgroundColor: event.categoryColor }} />{event.categoryName}</span></td><td><StatusBadge status={event.status} /></td><td className="table-actions"><Link href={`/Demo839web/administration/activites/${event.id}`}>Modifier</Link>{event.status !== "published" && <EventStatusForm id={event.id} yearId={year.id} status="published" label="Publier" />}{event.status !== "cancelled" && <EventStatusForm id={event.id} yearId={year.id} status="cancelled" label="Annuler" />}{event.status !== "archived" && <EventStatusForm id={event.id} yearId={year.id} status="archived" label="Archiver" />}</td></tr>)}
            </tbody></table>
          </div>
        </section>

        <div className="admin-two-column">
          <section className="admin-section" id="horaire">
            <div className="admin-section__heading"><div><p className="eyebrow">Récurrences</p><h2>Horaire régulier</h2></div></div>
            <details className="admin-create">
              <summary>Ajouter un rendez-vous régulier</summary>
              <form className="admin-form" action={createRecurringAction}>
                <input type="hidden" name="calendarYearId" value={year.id} />
                <label className="field field--wide"><span>Nom</span><input name="title" required /></label>
                <label className="field"><span>Jour</span><select name="weekday" defaultValue="3"><option value="1">Lundi</option><option value="2">Mardi</option><option value="3">Mercredi</option><option value="4">Jeudi</option><option value="5">Vendredi</option><option value="6">Samedi</option><option value="0">Dimanche</option></select></label>
                <label className="field"><span>Libellé du jour</span><input name="weekdayLabel" placeholder="Mercredi" required /></label>
                <label className="field"><span>Heure</span><input name="timeLabel" placeholder="18 h 30 à 21 h" /></label>
                <label className="field"><span>Catégorie</span><select name="categoryId"><option value="">Aucune</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
                <label className="field"><span>État</span><select name="status"><option value="draft">Brouillon</option><option value="published">Publié</option></select></label>
                <button className="button field--wide" type="submit">Enregistrer</button>
              </form>
            </details>
            <div className="simple-list">{recurring.map((item) => <article key={item.id}><span style={{ backgroundColor: item.categoryColor ?? "#b6d5dc" }} /><div><strong>{item.title}</strong><small>{item.weekdayLabel}{item.timeLabel ? ` · ${item.timeLabel}` : ""}</small></div><StatusBadge status={item.status} /><form action={setRecurringStatusAction}><input type="hidden" name="id" value={item.id} /><input type="hidden" name="calendarYearId" value={year.id} /><input type="hidden" name="status" value={item.status === "published" ? "archived" : "published"} /><button type="submit">{item.status === "published" ? "Archiver" : "Publier"}</button></form></article>)}</div>
          </section>

          <section className="admin-section" id="categories">
            <div className="admin-section__heading"><div><p className="eyebrow">Couleurs</p><h2>Catégories</h2></div></div>
            <div className="category-admin-list">{categories.map((item) => <span key={item.id}><i style={{ backgroundColor: item.color }} />{item.name}</span>)}</div>
            <details className="admin-create">
              <summary>Ajouter une catégorie</summary>
              <form className="admin-form admin-form--compact" action={createCategoryAction}><label className="field"><span>Nom</span><input name="name" required /></label><label className="field"><span>Identifiant</span><input name="slug" placeholder="activite-speciale" required /></label><label className="field"><span>Couleur</span><input type="color" name="color" defaultValue="#0aa6d9" /></label><button className="button" type="submit">Ajouter</button></form>
            </details>
          </section>
        </div>

        <section className="admin-section">
          <div className="admin-section__heading"><div><p className="eyebrow">Traçabilité</p><h2>Dernières modifications</h2></div></div>
          <div className="audit-list">{audit.map((item) => <article key={item.id}><div><strong>{item.summary}</strong><small>{item.displayName ?? "Système"} · {item.createdAt}</small></div><span>{item.action}</span></article>)}{audit.length === 0 && <p>Aucune modification enregistrée.</p>}</div>
        </section>
      </div>
    </AdminShell>
  );
}

function StatusForm({ action, id, status, label }: { action: (data: FormData) => Promise<void>; id: number; status: string; label: string }) {
  return <form action={action}><input type="hidden" name="id" value={id} /><input type="hidden" name="status" value={status} /><button type="submit">{label}</button></form>;
}

function EventStatusForm({ id, yearId, status, label }: { id: number; yearId: number; status: string; label: string }) {
  return <form action={setEventStatusAction}><input type="hidden" name="id" value={id} /><input type="hidden" name="calendarYearId" value={yearId} /><input type="hidden" name="status" value={status} /><button type="submit">{label}</button></form>;
}

