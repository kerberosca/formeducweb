import { Card, CardContent } from "@/components/ui/card";

export default function MentionsLegalesPage() {
  return (
    <section className="container py-16 md:py-24">
      <div className="max-w-4xl space-y-8">
        <div className="space-y-4">
          <p className="eyebrow">Mentions légales</p>
          <h1 className="font-heading text-5xl font-semibold tracking-tight">Informations générales sur l&apos;éditeur du site</h1>
        </div>

        {[
          {
            title: "Nom utilisé sur le site",
            body: "ForméducWeb est la dénomination utilisée pour présenter les services affichés sur ce site."
          },
          {
            title: "Territoire",
            body:
              "Les services visent principalement une clientèle située au Québec (Canada), avec adaptation possible selon l'entente."
          },
          {
            title: "Coordonnées",
            body: "Courriel: bonjour@formeducweb.ca | Téléphone: (514) 555-0148 | Localisation: Montréal, Québec."
          },
          {
            title: "Responsable confidentialité",
            body:
              "Le point de contact pour les demandes liées à la confidentialité est joignable à bonjour@formeducweb.ca."
          },
          {
            title: "Hébergement et exploitation",
            body:
              "Le site est conçu pour être déployé sur Vercel. Les environnements techniques et fournisseurs peuvent évoluer selon les besoins du projet."
          }
        ].map((section) => (
          <Card key={section.title}>
            <CardContent className="space-y-3 p-8">
              <h2 className="font-heading text-2xl font-semibold">{section.title}</h2>
              <p className="text-sm leading-7 text-muted-foreground">{section.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
