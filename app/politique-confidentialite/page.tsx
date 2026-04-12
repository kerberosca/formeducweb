import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";

const sections = [
  {
    title: "Collecte",
    body:
      "Nous recueillons uniquement les informations necessaires a nos services: nom, entreprise, courriel, telephone optionnel, consentement marketing optionnel, reponses au questionnaire et informations de paiement gerees par Stripe."
  },
  {
    title: "Finalites",
    body:
      "Ces informations servent a produire votre diagnostic, gerer votre acces au rapport, assurer le support client et, si vous y consentez, envoyer des communications utiles sur nos services."
  },
  {
    title: "Cookies et technologies similaires",
    body:
      "Le site utilise des cookies techniques necessaires au fonctionnement et a la securite. Les cookies non essentiels (analytics, Google Ads, pixels publicitaires) restent bloques tant que vous n'avez pas donne un consentement explicite."
  },
  {
    title: "Publicite et mesure",
    body:
      "Si vous acceptez la categorie Marketing, le site peut activer Google Ads pour mesurer les conversions publicitaires (par exemple la soumission du formulaire d'auto-evaluation). Selon la configuration, Meta Pixel peut aussi etre active."
  },
  {
    title: "Conservation",
    body:
      "Les brouillons locaux de l'assistant expirent automatiquement. Cote serveur, les donnees sont conservees selon une duree raisonnable liee aux finalites d'affaires, a la securite et aux obligations applicables."
  },
  {
    title: "Securite",
    body:
      "Le site applique des controles techniques raisonnables (validation, limitation d'abus, tokens d'acces non devinables, protections d'en-tetes HTTP, pages sensibles non indexees, cache desactive sur les routes sensibles)."
  },
  {
    title: "Fournisseurs et transferts",
    body:
      "Certains fournisseurs techniques peuvent traiter des donnees en dehors du Quebec ou du Canada, selon leur infrastructure. Ces traitements restent encadres par vos choix de consentement et les obligations applicables."
  },
  {
    title: "Vos droits",
    body:
      "Vous pouvez demander un acces, une rectification, un retrait de consentement, ou discuter d'une suppression selon les obligations applicables et les exceptions legales."
  },
  {
    title: "Responsable et contact",
    body: "Pour toute question relative a la confidentialite, ecrivez a info@formeducweb.ca."
  }
];

export default function PolitiqueConfidentialitePage() {
  return (
    <section className="container py-16 md:py-24">
      <div className="max-w-4xl space-y-8">
        <div className="space-y-4">
          <p className="eyebrow">Politique de confidentialite</p>
          <h1 className="font-heading text-5xl font-semibold tracking-tight">Comment FormeducWeb traite les renseignements transmis</h1>
          <p className="text-lg leading-8 text-muted-foreground">
            Cette page decrit la collecte, l utilisation, la conservation et les droits associes aux donnees recueillies
            via le contact, l assistant Loi 25 et les paiements Stripe.
          </p>
        </div>

        {sections.map((section) => (
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
              Consultez aussi la{" "}
              <Link href="/politique-cookies" className="underline underline-offset-4">
                Politique cookies
              </Link>
              .
            </p>
            <p>
              Pour gerer ou retirer vos choix cookies, ouvrez{" "}
              <Link href="/politique-cookies#preferences-cookies" className="underline underline-offset-4">
                Gerer mes cookies
              </Link>
              .
            </p>
            <p>
              Pour exercer vos droits, utilisez la page{" "}
              <Link href="/demande-confidentialite" className="underline underline-offset-4">
                Demande confidentialite
              </Link>
              .
            </p>
            <p>Cette politique presente une vue operationnelle generale et ne constitue pas un avis juridique.</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
