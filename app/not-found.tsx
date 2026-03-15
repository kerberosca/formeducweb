export default function NotFound() {
  return (
    <section className="container py-24">
      <div className="max-w-xl space-y-4">
        <p className="eyebrow">Erreur 404</p>
        <h1 className="font-heading text-4xl font-semibold tracking-tight">La page demandée n’existe pas.</h1>
        <p className="text-lg leading-8 text-muted-foreground">
          Revenez à l’accueil ou contactez ForméducWeb si vous cherchiez une ressource précise.
        </p>
      </div>
    </section>
  );
}

