import {
  BrainCircuit,
  Database,
  FileCheck2,
  KeyRound,
  Network,
  Scale,
  ShieldCheck,
  UserCheck
} from "lucide-react";

import type { SeoSupportTheme } from "@/lib/seo-content";

type ArticleThemeVisualProps = {
  theme: SeoSupportTheme;
  title: string;
};

const visualContent = {
  hygiene: {
    icon: Network,
    label: "Hygiène numérique",
    description:
      "Une discipline commune relie les données, les accès et les usages responsables.",
    nodes: [
      { icon: Database, label: "Données connues" },
      { icon: KeyRound, label: "Accès maîtrisés" },
      { icon: UserCheck, label: "Routines d’équipe" }
    ]
  },
  loi25: {
    icon: Scale,
    label: "Protection des renseignements",
    description:
      "La connaissance des données soutient la transparence et la capacité d’agir.",
    nodes: [
      { icon: Database, label: "Inventorier" },
      { icon: FileCheck2, label: "Documenter" },
      { icon: UserCheck, label: "Répondre" }
    ]
  },
  cybersecurity: {
    icon: ShieldCheck,
    label: "Résilience cyber",
    description:
      "Des mesures de base répétées réduisent les risques et facilitent le rétablissement.",
    nodes: [
      { icon: KeyRound, label: "Protéger les accès" },
      { icon: Database, label: "Sauvegarder" },
      { icon: FileCheck2, label: "Préparer l’incident" }
    ]
  },
  ai: {
    icon: BrainCircuit,
    label: "IA responsable",
    description:
      "Un usage utile repose sur des données protégées, des règles claires et une validation humaine.",
    nodes: [
      { icon: Database, label: "Protéger les données" },
      { icon: FileCheck2, label: "Encadrer les usages" },
      { icon: UserCheck, label: "Valider humainement" }
    ]
  }
} as const;

export function ArticleThemeVisual({ theme, title }: ArticleThemeVisualProps) {
  const content = visualContent[theme];
  const titleId = `visual-${theme}-${title
    .toLocaleLowerCase("fr-CA")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}`;
  const MainIcon = content.icon;

  return (
    <figure
      aria-labelledby={titleId}
      className="overflow-hidden rounded-[28px] border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-orange-50/80 p-6 md:p-8"
    >
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-halo">
            <MainIcon className="h-8 w-8" aria-hidden="true" />
          </div>
          <div>
            <p
              id={titleId}
              className="font-heading text-xl font-semibold text-foreground"
            >
              {content.label}
            </p>
            <figcaption className="mt-1 text-sm leading-6 text-muted-foreground">
              {content.description}
            </figcaption>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {content.nodes.map((node, index) => (
            <div
              key={node.label}
              className="relative rounded-2xl border border-border/70 bg-white/85 p-4"
            >
              <span className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <node.icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <p className="text-sm font-semibold leading-5 text-foreground">
                {node.label}
              </p>
              <span className="absolute right-3 top-3 text-xs font-semibold text-primary/50">
                {index + 1}
              </span>
            </div>
          ))}
        </div>
      </div>
    </figure>
  );
}
