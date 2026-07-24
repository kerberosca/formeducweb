import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  FilePenLine,
  FileSpreadsheet,
  FileText
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DiagnosticConfig } from "@/lib/diagnostics";

type KitPreviewProps = {
  diagnostic: DiagnosticConfig;
};

const previewItems = {
  loi25: [
    {
      icon: FileSpreadsheet,
      label: "Inventaire des données (XLSX)",
      image: "/exemples/apercus/inventaire-donnees-loi25-inventaire.png"
    },
    {
      icon: FileSpreadsheet,
      label: "Registre d’incidents (XLSX)",
      image: "/exemples/apercus/registre-incidents-loi25-incidents.png"
    },
    {
      icon: FilePenLine,
      label: "Procédure de demandes et textes de formulaire (DOCX)",
      image: "/exemples/apercus/procedure-demandes-loi25.png"
    }
  ],
  cybersecurity: [
    {
      icon: FilePenLine,
      label: "Procédure d’incident (DOCX)",
      image: "/exemples/apercus/procedure-incident-cyber.png"
    },
    {
      icon: FileSpreadsheet,
      label: "Checklist accès et sauvegardes (XLSX)",
      image: "/exemples/apercus/checklist-acces-sauvegardes-sommaire.png"
    },
    {
      icon: FileText,
      label: "Mémo antifraude (DOCX)",
      image: "/exemples/apercus/memo-antifraude.png"
    }
  ],
  ai: [
    {
      icon: FilePenLine,
      label: "Charte IA éditable (DOCX)",
      image: "/exemples/apercus/charte-ia-editable.png"
    },
    {
      icon: FileSpreadsheet,
      label: "Registre des usages IA (XLSX)",
      image: "/exemples/apercus/registre-usages-ia-registre-ia.png"
    },
    {
      icon: FileText,
      label: "Mémo d’équipe (DOCX)",
      image: "/exemples/apercus/memo-equipe-ia.png"
    }
  ]
} as const;

export function KitPreview({ diagnostic }: KitPreviewProps) {
  const items = previewItems[diagnostic.type];
  const samplePdfPath = `/exemples/kit-${diagnostic.slug}-exemple.pdf`;

  return (
    <Card className="overflow-hidden border-primary/20 bg-white/90">
      <CardHeader className="border-b border-border/70 bg-primary/5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Badge variant="secondary">Exemple fictif</Badge>
            <CardTitle className="mt-3">
              Voyez ce que vous pourrez réellement utiliser
            </CardTitle>
          </div>
          <Button asChild variant="secondary">
            <Link href={samplePdfPath} target="_blank">
              Ouvrir l’exemple PDF
              <ArrowUpRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 p-6 md:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="overflow-hidden rounded-2xl border border-border/70 bg-background"
          >
            <div className="relative h-52 border-b border-border/70 bg-muted/25">
              <Image
                src={item.image}
                alt={`Aperçu fictif du gabarit ${item.label}`}
                fill
                sizes="(min-width: 768px) 30vw, 90vw"
                className="object-contain p-3"
              />
              <Badge
                variant="secondary"
                className="absolute left-3 top-3 shadow-sm"
              >
                Aperçu fictif
              </Badge>
            </div>
            <div className="p-5">
              <item.icon
                className="mb-4 h-6 w-6 text-primary"
                aria-hidden="true"
              />
              <p className="text-sm font-semibold leading-6">{item.label}</p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Personnalisé avec votre entreprise et vos réponses pertinentes.
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
