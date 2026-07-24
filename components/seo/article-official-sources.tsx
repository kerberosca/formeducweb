import Link from "next/link";
import { ArrowUpRight, Landmark } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SeoSupportTheme } from "@/lib/seo-content";

export type OfficialSource = {
  organization: string;
  title: string;
  href: string;
};

const officialSources: Record<SeoSupportTheme, readonly OfficialSource[]> = {
  hygiene: [
    {
      organization: "Commission d’accès à l’information du Québec",
      title: "Principaux changements découlant de la Loi 25",
      href: "https://www.cai.gouv.qc.ca/protection-renseignements-personnels/sujets-et-domaines-dinteret/principaux-changements-loi-25"
    },
    {
      organization: "Centre canadien pour la cybersécurité",
      title:
        "Contrôles de cybersécurité de base pour les petites et moyennes organisations",
      href: "https://www.cyber.gc.ca/fr/orientation/controles-de-cybersecurite-de-base-pour-les-petites-et-moyennes-organisations"
    },
    {
      organization: "Commissariat à la protection de la vie privée du Canada",
      title:
        "Principes pour des technologies d’IA générative responsables et respectueuses de la vie privée",
      href: "https://www.priv.gc.ca/fr/sujets-lies-a-la-protection-de-la-vie-privee/technologie/intelligence-artificielle/gd_principes_ia/"
    }
  ],
  loi25: [
    {
      organization: "Commission d’accès à l’information du Québec",
      title: "Entreprises et organisations privées",
      href: "https://www.cai.gouv.qc.ca/protection-renseignements-personnels/information-entreprises-privees"
    },
    {
      organization: "Commission d’accès à l’information du Québec",
      title: "Principaux changements découlant de la Loi 25",
      href: "https://www.cai.gouv.qc.ca/protection-renseignements-personnels/sujets-et-domaines-dinteret/principaux-changements-loi-25"
    },
    {
      organization: "Commission d’accès à l’information du Québec",
      title: "Incidents de confidentialité et mesures de sécurité",
      href: "https://www.cai.gouv.qc.ca/protection-renseignements-personnels/information-entreprises-privees/incidents-confidentialite-mesures-securite-entreprises"
    }
  ],
  cybersecurity: [
    {
      organization: "Centre canadien pour la cybersécurité",
      title:
        "Contrôles de cybersécurité de base pour les petites et moyennes organisations",
      href: "https://www.cyber.gc.ca/fr/orientation/controles-de-cybersecurite-de-base-pour-les-petites-et-moyennes-organisations"
    },
    {
      organization: "Centre canadien pour la cybersécurité",
      title:
        "Les meilleures mesures pour renforcer la cybersécurité des petites et moyennes entreprises",
      href: "https://www.cyber.gc.ca/fr/orientation/les-meilleures-mesures-pour-renforcer-la-cybersecurite-des-petites-et-moyennes"
    },
    {
      organization: "Centre canadien pour la cybersécurité",
      title: "Information pour les petites et moyennes entreprises",
      href: "https://www.cyber.gc.ca/fr/petites-moyennes-entreprises"
    }
  ],
  ai: [
    {
      organization: "Commissariat à la protection de la vie privée du Canada",
      title:
        "Principes pour des technologies d’IA générative responsables et respectueuses de la vie privée",
      href: "https://www.priv.gc.ca/fr/sujets-lies-a-la-protection-de-la-vie-privee/technologie/intelligence-artificielle/gd_principes_ia/"
    },
    {
      organization: "Innovation, Sciences et Développement économique Canada",
      title:
        "Guide de mise en œuvre pour les gestionnaires de systèmes d’intelligence artificielle",
      href: "https://ised-isde.canada.ca/site/isde/fr/guide-mise-oeuvre-pour-gestionnaires-systemes-dintelligence-artificielle"
    },
    {
      organization: "Gouvernement du Canada",
      title:
        "Guide sur l’utilisation de l’intelligence artificielle générative",
      href: "https://www.canada.ca/fr/gouvernement/systeme/gouvernement-numerique/innovations-gouvernementales-numeriques/utilisation-responsable-ai/guide-utilisation-intelligence-artificielle-generative.html"
    }
  ]
};

export function getOfficialSources(
  theme: SeoSupportTheme
): readonly OfficialSource[] {
  return officialSources[theme];
}

export function ArticleOfficialSources({ theme }: { theme: SeoSupportTheme }) {
  const sources = getOfficialSources(theme);

  return (
    <section className="space-y-5" aria-labelledby="official-sources-heading">
      <div>
        <h2
          id="official-sources-heading"
          className="font-heading text-2xl font-semibold tracking-tight text-foreground md:text-3xl"
        >
          Sources officielles pour aller plus loin
        </h2>
        <p className="mt-3 leading-7 text-muted-foreground">
          Ces références gouvernementales soutiennent les principes présentés
          dans ce guide. Vérifiez-les selon votre contexte et leur date de mise
          à jour.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-lg">
            <Landmark className="h-5 w-5 text-primary" aria-hidden="true" />
            Références consultables
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 p-6 pt-0">
          {sources.map((source) => (
            <Link
              key={source.href}
              href={source.href}
              target="_blank"
              rel="noreferrer"
              className="group flex items-start justify-between gap-4 rounded-2xl border border-border/70 bg-background p-4 transition hover:border-primary/40 hover:bg-primary/5"
            >
              <span>
                <span className="block text-xs font-semibold uppercase tracking-wide text-primary">
                  {source.organization}
                </span>
                <span className="mt-1 block text-sm font-medium leading-6 text-foreground">
                  {source.title}
                </span>
              </span>
              <ArrowUpRight
                className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition group-hover:text-primary"
                aria-hidden="true"
              />
              <span className="sr-only">(ouvre un nouvel onglet)</span>
            </Link>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
