import { AdminNotice, AdminShell } from "@/components/demo839/admin";
import { requireAdmin } from "@/lib/demo839/admin-auth";
import { getAdminUsers } from "@/lib/demo839/data";
import { createAdminAction, resetAdminPasswordAction, toggleAdminAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function AccountsPage({ searchParams }: { searchParams: Promise<{ message?: string; erreur?: string }> }) {
  const user = await requireAdmin();
  const [users, params] = await Promise.all([getAdminUsers(), searchParams]);
  return (
    <AdminShell user={user}>
      <div className="admin-main">
        <AdminNotice message={params.message} error={params.erreur} />
        <header className="admin-title-row"><div><p className="eyebrow">Accès protégés</p><h1>Comptes administrateurs</h1><p>Chaque responsable utilise son propre nom d’usager.</p></div></header>
        <div className="admin-two-column admin-two-column--accounts">
          <section className="admin-section">
            <div className="admin-section__heading"><div><p className="eyebrow">Nouveau responsable</p><h2>Créer un compte</h2></div></div>
            <form className="admin-form" action={createAdminAction}>
              <label className="field"><span>Nom complet</span><input name="displayName" required maxLength={80} /></label>
              <label className="field"><span>Nom d’usager</span><input name="username" required minLength={3} maxLength={40} autoComplete="off" /></label>
              <label className="field field--wide"><span>Mot de passe temporaire</span><input type="password" name="password" required minLength={12} autoComplete="new-password" /><small>La personne devra le remplacer à sa première connexion.</small></label>
              <button className="button field--wide" type="submit">Créer le compte</button>
            </form>
          </section>
          <section className="admin-section">
            <div className="admin-section__heading"><div><p className="eyebrow">Règle de sécurité</p><h2>Accès individuels</h2></div></div>
            <p className="admin-copy">Ne partagez pas un même compte entre plusieurs personnes. Les modifications sont associées au responsable connecté et le dernier compte actif ne peut pas être désactivé.</p>
          </section>
        </div>
        <section className="admin-section">
          <div className="admin-section__heading"><div><p className="eyebrow">Responsables autorisés</p><h2>Comptes existants</h2></div><span>{users.filter((item) => item.isActive).length} actif{users.filter((item) => item.isActive).length !== 1 ? "s" : ""}</span></div>
          <div className="account-list">
            {users.map((item) => (
              <article key={item.id} className={!item.isActive ? "is-disabled" : ""}>
                <div className="account-avatar">{item.displayName.slice(0, 1).toUpperCase()}</div>
                <div><strong>{item.displayName}</strong><span>@{item.username}</span><small>{item.lastLoginAt ? `Dernière connexion : ${item.lastLoginAt}` : "Aucune connexion"}{item.mustChangePassword ? " · Mot de passe temporaire" : ""}</small></div>
                <form className="reset-password-form" action={resetAdminPasswordAction}><input type="hidden" name="id" value={item.id} /><label><span>Nouveau mot de passe temporaire</span><input type="password" name="password" minLength={12} required /></label><button type="submit">Réinitialiser</button></form>
                <form action={toggleAdminAction}><input type="hidden" name="id" value={item.id} /><input type="hidden" name="activate" value={item.isActive ? "0" : "1"} /><button className={item.isActive ? "danger-link" : ""} type="submit">{item.isActive ? "Désactiver" : "Réactiver"}</button></form>
              </article>
            ))}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}

