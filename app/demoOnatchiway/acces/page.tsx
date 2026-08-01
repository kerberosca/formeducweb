type AccessPageProps = {
  searchParams: Promise<{ erreur?: string }>;
};

export default async function AccessPage({ searchParams }: AccessPageProps) {
  const { erreur } = await searchParams;
  const hasError = erreur === "1";

  return (
    <main className="demo-access">
      <style>{`
        .demo-access { --forest:#132720; --green:#8fb318; --lichen:#e6e9da; min-height:100svh; display:grid; place-items:center; padding:24px; background:radial-gradient(circle at 75% 15%,rgba(143,179,24,.16),transparent 28%),linear-gradient(145deg,#0d1d17,var(--forest)); color:var(--lichen); font-family:Arial,sans-serif; }
        .demo-access * { box-sizing:border-box; }
        .demo-access__card { width:min(100%,480px); border:1px solid rgba(230,233,218,.2); background:rgba(19,39,32,.88); padding:clamp(28px,7vw,52px); box-shadow:0 28px 80px rgba(0,0,0,.28); }
        .demo-access__kicker { margin:0 0 18px; color:var(--green); font-size:.75rem; font-weight:800; letter-spacing:.18em; text-transform:uppercase; }
        .demo-access h1 { margin:0; max-width:10ch; font-size:clamp(2.5rem,10vw,4.8rem); line-height:.92; letter-spacing:-.035em; text-transform:uppercase; }
        .demo-access__intro { margin:24px 0 30px; color:rgba(230,233,218,.76); font-size:1rem; line-height:1.65; }
        .demo-access label { display:block; margin-bottom:9px; font-size:.8rem; font-weight:800; letter-spacing:.1em; text-transform:uppercase; }
        .demo-access input { width:100%; min-height:52px; border:1px solid rgba(230,233,218,.32); border-radius:0; background:#0d1d17; color:#fff; padding:12px 14px; font:inherit; }
        .demo-access input:focus-visible { outline:3px solid var(--green); outline-offset:3px; }
        .demo-access button { width:100%; min-height:52px; margin-top:14px; border:0; background:var(--green); color:#102018; padding:13px 18px; font:800 .82rem/1 Arial,sans-serif; letter-spacing:.12em; text-transform:uppercase; cursor:pointer; }
        .demo-access button:hover { filter:brightness(1.08); }
        .demo-access button:focus-visible { outline:3px solid var(--lichen); outline-offset:3px; }
        .demo-access__error { margin:0 0 16px; border-left:3px solid #d7ed7f; padding:10px 12px; background:rgba(143,179,24,.12); color:#f6f8ef; line-height:1.45; }
        .demo-access__note { margin:18px 0 0; color:rgba(230,233,218,.58); font-size:.78rem; line-height:1.5; }
      `}</style>
      <section className="demo-access__card" aria-labelledby="access-title">
        <p className="demo-access__kicker">Zec Onatchiway</p>
        <h1 id="access-title">Démo privée</h1>
        <p className="demo-access__intro">
          Cette démonstration est réservée aux personnes qui ont reçu le mot de
          passe de l’équipe.
        </p>
        {hasError ? (
          <p className="demo-access__error" role="alert">
            Le mot de passe n’est pas reconnu. Veuillez réessayer.
          </p>
        ) : null}
        <form action="/demoOnatchiway/acces/valider" method="post">
          <label htmlFor="password">Mot de passe</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            autoFocus
          />
          <button type="submit">Accéder à la démo</button>
        </form>
        <p className="demo-access__note">
          Après l’ouverture, l’accès restera mémorisé jusqu’à 90 jours sur cet
          appareil.
        </p>
      </section>
    </main>
  );
}
