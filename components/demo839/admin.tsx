import Link from "next/link";
import type { ReactNode } from "react";
import type { AdminSessionUser } from "@/lib/demo839/admin-auth";
import type { AdminEventRecord, AnnouncementRecord, CategoryRecord, CalendarYearRecord } from "@/lib/demo839/data";
import { createAnnouncementAction, createEventAction, logoutAction, updateAnnouncementAction, updateEventAction } from "@/app/Demo839web/administration/actions";

export function AdminShell({ user, children }: { user: AdminSessionUser; children: ReactNode }) {
  return (
    <main className="admin-shell">
      <header className="admin-header">
        <Link className="brand" href="/Demo839web/administration">
          <span className="brand-logo"><img src="/Demo839web/logo-couleur.png" alt="" /></span>
          <span className="brand-copy"><strong>Administration</strong><small>Escadron 839</small></span>
        </Link>
        <nav aria-label="Navigation de l’administration">
          <Link href="/Demo839web/administration">Calendrier et annonces</Link>
          <Link href="/Demo839web/administration/comptes">Comptes</Link>
          <Link href="/Demo839web/communications" target="_blank">Voir le site ↗</Link>
        </nav>
        <div className="admin-user"><span>{user.displayName}</span><form action={logoutAction}><button type="submit">Déconnexion</button></form></div>
      </header>
      {children}
    </main>
  );
}

export function AdminNotice({ message, error }: { message?: string; error?: string }) {
  if (!message && !error) return null;
  return <div className={`admin-flash ${error ? "admin-flash--error" : ""}`} role="status">{error ?? message}</div>;
}

export function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = {
    draft: "Brouillon",
    published: "Publié",
    cancelled: "Annulée",
    archived: "Archivé",
  };
  return <span className={`status-badge status-${status}`}>{labels[status] ?? status}</span>;
}

export function AnnouncementForm({ announcement }: { announcement?: AnnouncementRecord }) {
  const action = announcement ? updateAnnouncementAction : createAnnouncementAction;
  return (
    <form className="admin-form" action={action}>
      {announcement && <input type="hidden" name="id" value={announcement.id} />}
      <label className="field field--wide"><span>Titre</span><input name="title" required maxLength={120} defaultValue={announcement?.title} /></label>
      <label className="field field--wide"><span>Message public</span><textarea name="body" required maxLength={4000} rows={5} defaultValue={announcement?.body} /></label>
      <label className="field"><span>Date de publication</span><input type="date" name="publishDate" required defaultValue={announcement?.publishDate} /></label>
      <label className="field"><span>Expiration facultative</span><input type="date" name="expiresOn" defaultValue={announcement?.expiresOn ?? ""} /></label>
      <label className="field"><span>État</span><select name="status" defaultValue={announcement?.status ?? "draft"}><option value="draft">Brouillon</option><option value="published">Publié immédiatement</option><option value="archived">Archivé</option></select></label>
      <label className="check-field"><input type="checkbox" name="isPinned" defaultChecked={Boolean(announcement?.isPinned)} /><span>Annonce importante à épingler</span></label>
      <div className="form-actions field--wide"><button className="button" type="submit">{announcement ? "Mettre à jour" : "Enregistrer l’annonce"}</button>{announcement && <Link href="/Demo839web/administration#annonces">Annuler</Link>}</div>
    </form>
  );
}

export function EventForm({
  year,
  categories,
  event,
}: {
  year: CalendarYearRecord;
  categories: CategoryRecord[];
  event?: AdminEventRecord;
}) {
  const action = event ? updateEventAction : createEventAction;
  return (
    <form className="admin-form" action={action}>
      {event && <input type="hidden" name="id" value={event.id} />}
      <input type="hidden" name="calendarYearId" value={year.id} />
      <label className="field field--wide"><span>Nom de l’activité</span><input name="title" required maxLength={140} defaultValue={event?.title} /></label>
      <label className="field"><span>Date de début</span><input type="date" name="startDate" required defaultValue={event?.startDate} /></label>
      <label className="field"><span>Date de fin</span><input type="date" name="endDate" required defaultValue={event?.endDate} /></label>
      <label className="field"><span>Catégorie</span><select name="categoryId" required defaultValue={event?.categoryId}>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
      <label className="field"><span>Type</span><select name="callout" defaultValue={event?.callout ?? "standard"}><option value="standard">Activité</option><option value="parade_month">Parade du mois</option><option value="parade_commandant">Parade du commandant</option></select></label>
      <label className="field"><span>État</span><select name="status" defaultValue={event?.status ?? "draft"}><option value="draft">Brouillon</option><option value="published">Publié</option><option value="cancelled">Annulée</option><option value="archived">Archivé</option></select></label>
      <label className="field"><span>Lieu facultatif</span><input name="location" maxLength={160} defaultValue={event?.location} /></label>
      <label className="field field--wide"><span>Description publique facultative</span><textarea name="description" rows={3} maxLength={3000} defaultValue={event?.description} /></label>
      <label className="field field--wide"><span>Message d’annulation facultatif</span><input name="cancellationNote" maxLength={500} defaultValue={event?.cancellationNote} /></label>
      <div className="form-actions field--wide"><button className="button" type="submit">{event ? "Mettre à jour" : "Enregistrer l’activité"}</button>{event && <Link href="/Demo839web/administration#activites">Annuler</Link>}</div>
    </form>
  );
}

