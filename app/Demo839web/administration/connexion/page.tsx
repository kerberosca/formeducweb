import type { Metadata } from "next";
import Link from "next/link";
import { getAdminSession } from "@/lib/demo839/admin-auth";
import { redirect } from "next/navigation";
import { loginAction } from "../actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Connexion à l’administration" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ erreur?: string; message?: string }> }) {
  const existing = await getAdminSession().catch(() => null);
  if (existing) redirect(existing.mustChangePassword ? "/Demo839web/administration/mot-de-passe" : "/Demo839web/administration");
  const params = await searchParams;
  return (
    <main className="login-page">
      <section className="login-panel">
        <Link className="brand" href="/Demo839web"><span className="brand-logo"><img src="/Demo839web/logo-couleur.png" alt="" /></span><span className="brand-copy"><strong>Escadron 839</strong><small>Administration</small></span></Link>
        <div><p className="eyebrow">Espace protégé</p><h1>Connexion</h1><p>Réservé aux responsables autorisés de l’escadron.</p></div>
        {params.erreur && <p className="form-message form-message--error" role="alert">{params.erreur}</p>}
        {params.message && <p className="form-message" role="status">{params.message}</p>}
        <form action={loginAction} className="login-form">
          <label><span>Nom d’usager</span><input name="username" autoComplete="username" required /></label>
          <label><span>Mot de passe</span><input type="password" name="password" autoComplete="current-password" required /></label>
          <button className="button" type="submit">Se connecter</button>
        </form>
        <Link className="text-link" href="/Demo839web">← Retour au site</Link>
      </section>
      <div className="login-image"><img src="/Demo839web/parade-archives.jpg" alt="Parade de l’Escadron 839 sur un aérodrome." /></div>
    </main>
  );
}

