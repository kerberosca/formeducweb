import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type MerciPageProps = {
  searchParams?: Promise<{ source?: string }>;
};

export default async function MerciPage({ searchParams }: MerciPageProps) {
  const resolved = await searchParams;
  const source = resolved?.source;
  const isContact = source === "contact";

  return (
    <section className="container py-16 md:py-24">
      <Card className="mx-auto max-w-3xl">
        <CardContent className="space-y-6 p-10 text-center">
          <p className="eyebrow">Merci</p>
          <h1 className="font-heading text-4xl font-semibold tracking-tight md:text-5xl">
            {isContact ? "Votre message a bien été reçu." : "Votre démarche est bien lancée."}
          </h1>
          <p className="text-lg leading-8 text-muted-foreground">
            {isContact
              ? "On reviendra vers vous rapidement avec une prochaine étape adaptée à votre contexte."
              : "Vous pouvez maintenant poursuivre avec la wizard ou planifier un échange pour passer vos priorités."}
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/loi-25/wizard">Faire mon auto-évaluation Loi 25</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/contact">Retour au contact</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

