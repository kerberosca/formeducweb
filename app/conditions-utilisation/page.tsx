import { Card, CardContent } from "@/components/ui/card";

export default function ConditionsUtilisationPage() {
  return (
    <section className="container py-16 md:py-24">
      <div className="max-w-4xl space-y-8">
        <div className="space-y-4">
          <p className="eyebrow">Conditions d’utilisation</p>
          <h1 className="font-heading text-5xl font-semibold tracking-tight">Utilisation du site et de l’outil d’auto-évaluation</h1>
          <p className="text-lg leading-8 text-muted-foreground">
            L’utilisation du site implique l’acceptation générale des présentes conditions.
          </p>
        </div>

        {[
          {
            title: "Nature de l’outil",
            body:
              "L’assistant Loi 25 est un outil de diagnostic et d'alignement. Il sert à faire ressortir des écarts, à orienter un plan d'action et à soutenir une discussion plus approfondie."
          },
          {
            title: "Pas un avis juridique",
            body:
              "Le contenu du site, les rapports générés et les communications associées ne constituent pas un avis juridique et ne doivent pas être interprétés comme une garantie de conformité."
          },
          {
            title: "Limites du traitement automatisé",
            body:
              "Les résultats reposent sur les réponses déclarées. Ils doivent être interprétés avec jugement et, au besoin, complétés par une validation professionnelle adaptée à votre contexte."
          },
          {
            title: "Responsabilité",
            body:
              "Même si un soin raisonnable est apporté au contenu, ForméducWeb ne peut être tenu responsable d'une décision prise uniquement sur la base d'un résultat automatisé ou d'un résumé simplifié."
          },
          {
            title: "Utilisation appropriée",
            body:
              "Vous vous engagez à fournir des informations sincères et à utiliser le site de manière conforme aux lois applicables et à des fins légitimes."
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
