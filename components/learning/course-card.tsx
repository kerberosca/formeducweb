import Link from "next/link";
import {
  BrainCircuit,
  Clock3,
  FileSpreadsheet,
  FileText,
  Globe2,
  ShieldCheck,
  Workflow
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { PublicCourseSummary } from "@/components/lms/types";

const iconsByTheme = {
  internet: Globe2,
  ai: BrainCircuit,
  excel: FileSpreadsheet,
  word: FileText,
  cybersecurity: ShieldCheck,
  automation: Workflow
};

const themeLabels: Record<string, string> = {
  internet: "Internet",
  ai: "Intelligence artificielle",
  excel: "Excel",
  word: "Word",
  cybersecurity: "Cybersécurité",
  automation: "Automatisation"
};

const levelLabels: Record<string, string> = {
  beginner: "Débutant",
  debutant: "Débutant",
  intermediate: "Intermédiaire",
  intermediaire: "Intermédiaire",
  advanced: "Avancé",
  avance: "Avancé",
  enterprise: "Entreprise",
  entreprise: "Entreprise",
  custom: "Sur mesure",
  personnalise: "Sur mesure",
  all: "Tous niveaux"
};

const offerLabels: Record<string, string> = {
  free: "Gratuite",
  paid: "Payante",
  custom: "Sur mesure"
};

function getBadgeVariant(course: PublicCourseSummary) {
  if (course.offer === "custom") return "secondary" as const;
  if (course.offer === "paid") return "outline" as const;
  return "default" as const;
}

export function CourseCard({ course }: { course: PublicCourseSummary }) {
  const Icon =
    iconsByTheme[course.theme as keyof typeof iconsByTheme] ?? Globe2;
  const courseHref = `/formations/${course.slug}`;

  return (
    <Card className="flex h-full flex-col overflow-hidden bg-white/90">
      <CardHeader className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"
            aria-hidden="true"
          >
            <Icon className="h-6 w-6" />
          </span>
          <Badge variant={getBadgeVariant(course)}>
            {offerLabels[course.offer] ?? course.offer}
          </Badge>
        </div>

        <div>
          <p className="text-sm font-semibold text-primary">
            {themeLabels[course.theme] ?? course.theme}
          </p>
          <h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight">
            <Link
              href={courseHref}
              className="transition hover:text-primary focus-visible:rounded-sm"
            >
              {course.shortTitle}
            </Link>
          </h2>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-5">
        <p className="text-sm leading-7 text-muted-foreground">
          {course.description}
        </p>

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl bg-muted/40 p-3">
            <dt className="text-xs text-muted-foreground">Niveau</dt>
            <dd className="mt-1 font-medium">
              {levelLabels[course.level] ?? course.level}
            </dd>
          </div>
          <div className="rounded-2xl bg-muted/40 p-3">
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock3 className="h-3.5 w-3.5" aria-hidden="true" /> Durée
            </dt>
            <dd className="mt-1 font-medium">{course.durationLabel}</dd>
          </div>
        </dl>

        <div className="mt-auto flex items-center justify-between gap-4 border-t border-border/70 pt-5">
          <p className="font-heading text-lg font-semibold">
            {course.priceLabel}
          </p>
          <Button asChild variant="secondary">
            <Link href={courseHref}>Voir la formation</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
