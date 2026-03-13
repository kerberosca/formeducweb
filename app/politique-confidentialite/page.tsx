import { Card, CardContent } from "@/components/ui/card";

export default function PolitiqueConfidentialitePage() {
  return (
    <section className="container py-16 md:py-24">
      <div className="max-w-4xl space-y-8">
        <div className="space-y-4">
          <p className="eyebrow">Politique de confidentialité</p>
          <h1 className="font-heading text-5xl font-semibold tracking-tight">Comment FormÉducWeb traite les renseignements transmis</h1>
          <p className="text-lg leading-8 text-muted-foreground">
            Cette page résume la collecte effectuée via les formulaires de contact et la wizard d’auto-évaluation.
          </p>
        </div>

        {[
          {
            title: "Collecte",
            body:
              "Nous recueillons les informations que vous choisissez de fournir dans les formulaires du site, notamment votre nom, le nom de votre entreprise, votre courriel, votre téléphone si vous l’ajoutez, ainsi que vos réponses à la wizard Loi 25."
          },
          {
            title: "Finalités",
            body:
              "Ces informations servent à répondre à vos demandes, à générer un rapport d’auto-évaluation, à préparer un suivi commercial ou opérationnel et, si vous y consentez, à vous transmettre des communications pertinentes."
          },
          {
            title: "Conservation",
            body:
              "Les renseignements sont conservés pendant une durée raisonnable pour traiter votre demande, maintenir un historique utile et soutenir le suivi de la relation d’affaires. Les délais exacts peuvent varier selon le contexte."
          },
          {
            title: "Sécurité",
            body:
              "Nous prenons des mesures de protection raisonnables pour limiter les accès non autorisés, la perte ou la divulgation. Aucun système n’offre toutefois une sécurité absolue."
          },
          {
            title: "Droits et demandes",
            body:
              "Vous pouvez communiquer avec nous pour demander des précisions générales sur vos informations, demander une correction ou discuter d’une suppression, selon la situation et les obligations applicables."
          },
          {
            title: "Contact",
            body:
              "Pour toute question relative à la confidentialité ou à l’utilisation du questionnaire, écrivez à bonjour@formeducweb.ca."
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

