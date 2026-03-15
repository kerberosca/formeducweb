import Link from "next/link";

import { Button } from "@/components/ui/button";

type CtaBandProps = {
  title: string;
  description: string;
};

export function CtaBand({ title, description }: CtaBandProps) {
  return (
    <section className="container py-12 md:py-20">
      <div className="overflow-hidden rounded-[36px] border border-primary/15 bg-[linear-gradient(135deg,rgba(11,57,46,0.98),rgba(17,94,89,0.94))] px-8 py-10 text-white shadow-halo md:px-12">
        <div className="grid gap-8 md:grid-cols-[1.5fr_auto] md:items-center">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">Prochaine étape</p>
            <h2 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
            <p className="max-w-2xl text-lg leading-8 text-white/80">{description}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
            <Button asChild variant="secondary" className="border-white/25 bg-white text-primary hover:bg-white/95">
              <Link href="/loi-25/wizard">Faire mon auto-évaluation Loi 25</Link>
            </Button>
            <Button asChild variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
              <Link href="/contact">Parler à ForméducWeb</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

