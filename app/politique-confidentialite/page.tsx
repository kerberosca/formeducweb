import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";

export default function PolitiqueConfidentialitePage() {
  return (
    <section className="container py-16 md:py-24">
      <div className="max-w-4xl space-y-8">
        <div className="space-y-4">
          <p className="eyebrow">Politique de confidentialité</p>
          <h1 className="font-heading text-5xl font-semibold tracking-tight">Comment ForméducWeb traite les renseignements transmis</h1>
          <p className="text-lg leading-8 text-muted-foreground">
            Cette page décrit la collecte, l’utilisation, la conservation et les droits associés aux données recueillies
            via le contact, l’assistant Loi 25 et les paiements Stripe.
          </p>
        </div>

        {[
          {
            title: "Collecte",
            body:
              "Nous recueillons uniquement les informations nécessaires à nos services: nom, entreprise, courriel, téléphone optionnel, consentement marketing optionnel, réponses au questionnaire et informations de paiement gérées par Stripe."
          },
          {
            title: "Finalités",
            body:
              "Ces informations servent à produire votre diagnostic, gérer votre accès au rapport, assurer le support client et, si vous y consentez, envoyer des communications utiles sur nos services."
          },
          {
            title: "Cookies et technologies similaires",
            body:
              "Le site peut utiliser des cookies techniques nécessaires au fonctionnement et à la sécurité. Aucun cookie marketing ou analytics n’est activé par défaut dans ce projet. Pour les détails, consultez la Politique cookies."
          },
          {
            title: "Conservation",
            body:
              "Les brouillons locaux de l’assistant expirent automatiquement. Côté serveur, les données sont conservées selon une durée raisonnable liée aux finalités d'affaires, à la sécurité et aux obligations applicables."
          },
          {
            title: "Sécurité",
            body:
              "Le site applique des contrôles techniques raisonnables (validation, limitation d'abus, tokens d'accès non devinables, protections d'en-têtes HTTP, pages sensibles non indexées, cache désactivé sur les routes sensibles)."
          },
          {
            title: "Vos droits",
            body:
              "Vous pouvez demander un accès, une rectification, un retrait de consentement, ou discuter d'une suppression selon les obligations applicables et les exceptions légales."
          },
          {
            title: "Responsable et contact",
            body:
              "Pour toute question relative à la confidentialité, écrivez à info@formeducweb.ca."
          }
        ].map((section) => (
          <Card key={section.title}>
            <CardContent className="space-y-3 p-8">
              <h2 className="font-heading text-2xl font-semibold">{section.title}</h2>
              <p className="text-sm leading-7 text-muted-foreground">{section.body}</p>
            </CardContent>
          </Card>
        ))}

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="space-y-3 p-6 text-sm leading-7 text-muted-foreground">
            <p>
              Consultez aussi la <Link href="/politique-cookies" className="underline underline-offset-4">Politique cookies</Link>.
            </p>
            <p>
              Pour exercer vos droits, utilisez la page <Link href="/demande-confidentialite" className="underline underline-offset-4">Demande confidentialité</Link>.
            </p>
            <p>
              Cette politique présente une vue opérationnelle générale et ne constitue pas un avis juridique.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
