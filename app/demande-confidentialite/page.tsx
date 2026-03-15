import { PrivacyRequestForm } from "@/components/forms/privacy-request-form";
import { Card, CardContent } from "@/components/ui/card";

export default function DemandeConfidentialitePage() {
  return (
    <section className="container py-16 md:py-24">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-4">
          <p className="eyebrow">Confidentialité</p>
          <h1 className="font-heading text-5xl font-semibold tracking-tight">Exercer vos droits sur vos renseignements</h1>
          <p className="text-lg leading-8 text-muted-foreground">
            Vous pouvez utiliser ce formulaire pour demander un accès, une correction, un retrait de consentement ou
            discuter d’une suppression selon les obligations applicables.
          </p>
        </div>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="space-y-3 p-6 text-sm leading-7 text-muted-foreground">
            <p>
              Nous pourrions vous demander des précisions ou une vérification d’identité avant de traiter certaines
              demandes.
            </p>
            <p>
              Cet espace vise la gestion opérationnelle des droits. Il ne remplace pas un avis juridique ni une analyse
              de conformité spécifique.
            </p>
          </CardContent>
        </Card>

        <PrivacyRequestForm />
      </div>
    </section>
  );
}
