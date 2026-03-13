import { CtaBand } from "@/components/marketing/cta-band";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { aboutValues } from "@/lib/content";

export default function AboutPage() {
  return (
    <>
      <section className="container py-16 md:py-24">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-start">
          <div className="space-y-6">
            <p className="eyebrow">À propos</p>
            <h1 className="font-heading text-5xl font-semibold tracking-tight md:text-6xl">
              Web, conformité opérationnelle et implantation, dans le même langage.
            </h1>
            <p className="max-w-2xl text-xl leading-9 text-muted-foreground">
              FormÉducWeb existe pour aider les organisations qui veulent avancer sans se perdre entre le juridique, le
              web, la technique et le marketing.
            </p>
          </div>
          <Card>
            <CardContent className="space-y-4 p-8 text-sm leading-7 text-muted-foreground">
              <p>
                L’approche est volontairement sobre: pas de pression, pas de promesse exagérée, pas de jargon pour
                impressionner.
              </p>
              <p>
                L’objectif est d’établir un diagnostic utile, d’aligner les priorités et d’implanter ce qui compte
                réellement pour votre réalité d’affaires.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container py-10 md:py-16">
        <SectionHeading eyebrow="Valeurs" title="Comment on travaille" />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {aboutValues.map((value) => (
            <Card key={value.title}>
              <CardHeader>
                <CardTitle>{value.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-7 text-muted-foreground">{value.description}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <CtaBand
        title="Vous voulez une lecture honnête de votre situation?"
        description="Commencez par la wizard ou écrivez-nous pour expliquer votre contexte."
      />
    </>
  );
}

