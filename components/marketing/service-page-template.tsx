import Link from "next/link";

import { CtaBand } from "@/components/marketing/cta-band";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type ServicePageTemplateProps = {
  eyebrow: string;
  title: string;
  intro: string;
  bullets: readonly string[];
  deliverables: readonly string[];
  process: readonly string[];
};

export function ServicePageTemplate({
  eyebrow,
  title,
  intro,
  bullets,
  deliverables,
  process
}: ServicePageTemplateProps) {
  return (
    <>
      <section className="container py-16 md:py-24">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary/70">{eyebrow}</p>
            <h1 className="font-heading text-4xl font-semibold tracking-tight md:text-6xl">{title}</h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">{intro}</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/contact">Demander une proposition</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/loi-25/wizard">Faire mon auto-évaluation Loi 25</Link>
              </Button>
            </div>
          </div>

          <Card className="bg-white/85">
            <CardContent className="space-y-4 p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary/70">Ce qu’on travaille</p>
              <ul className="space-y-3 text-sm leading-7 text-muted-foreground">
                {bullets.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container py-10 md:py-14">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardContent className="space-y-5 p-8">
              <SectionHeading eyebrow="Livrables" title="Ce que vous recevez" />
              <ul className="space-y-3 text-sm leading-7 text-muted-foreground">
                {deliverables.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-5 p-8">
              <SectionHeading eyebrow="Processus" title="Comment on avance" />
              <ol className="space-y-4 text-sm leading-7 text-muted-foreground">
                {process.map((item, index) => (
                  <li key={item} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {index + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </section>

      <CtaBand
        title="Besoin d’un plan clair avant d’implanter?"
        description="Le diagnostic Loi 25 est une bonne porte d’entrée pour prioriser ce qui compte réellement dans votre contexte."
      />
    </>
  );
}
