import { requireAdmin } from "@/lib/demo839/admin-auth";
import { changeOwnPasswordAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function PasswordPage({ searchParams }: { searchParams: Promise<{ erreur?: string }> }) {
  const user = await requireAdmin({ allowPasswordChange: true });
  const params = await searchParams;
  return (
    <main className="login-page login-page--password">
      <section className="login-panel">
        <div className="brand"><span className="brand-logo"><img src="/Demo839web/logo-couleur.png" alt="" /></span><span className="brand-copy"><strong>Bienvenue, {user.displayName}</strong><small>Première connexion</small></span></div>
        <div><p className="eyebrow">Sécuriser votre compte</p><h1>Nouveau mot de passe</h1><p>Choisissez au moins 12 caractères. Vous serez ensuite invité à vous reconnecter.</p></div>
        {params.erreur && <p className="form-message form-message--error">{params.erreur}</p>}
        <form action={changeOwnPasswordAction} className="login-form">
          <label><span>Nouveau mot de passe</span><input type="password" name="password" minLength={12} autoComplete="new-password" required /></label>
          <label><span>Confirmer</span><input type="password" name="confirmation" minLength={12} autoComplete="new-password" required /></label>
          <button className="button" type="submit">Enregistrer mon mot de passe</button>
        </form>
      </section>
    </main>
  );
}

