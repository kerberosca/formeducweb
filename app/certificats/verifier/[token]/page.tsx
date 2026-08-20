import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileQuestion
} from "lucide-react";

import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/db";
import { getPublicCertificateByToken } from "@/lib/lms/certificates";

export const metadata: Metadata = {
  title: "Vérifier un certificat",
  robots: { index: false, follow: true }
};

export const dynamic = "force-dynamic";

export default async function VerifyCertificatePage({
  params
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const certificate = await getPublicCertificateByToken(token);

  if (!certificate) {
    return (
      <section className="container py-20">
        <Card className="mx-auto max-w-2xl">
          <CardContent className="p-8 text-center md:p-12">
            <FileQuestion
              className="mx-auto h-12 w-12 text-muted-foreground"
              aria-hidden="true"
            />
            <h1 className="mt-5 font-heading text-3xl font-semibold">
              Certificat introuvable
            </h1>
            <p className="mt-3 leading-7 text-muted-foreground">
              Le lien est invalide ou ne correspond à aucun certificat délivré
              par ForméducWeb.
            </p>
            <Button asChild variant="secondary" className="mt-6">
              <Link href="/formations">Voir les formations</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  const session = await auth();
  const owned = session?.user?.id
    ? await db.certificate.findFirst({
        where: { id: certificate.id, userId: session.user.id },
        select: { id: true }
      })
    : null;
  const active = certificate.status === "active";

  return (
    <section className="container py-16 md:py-24">
      <Card
        className={`mx-auto max-w-3xl ${active ? "border-emerald-200" : "border-amber-300"}`}
      >
        <CardContent className="p-8 md:p-12">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <span
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${active ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}
            >
              {active ? (
                <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
              ) : (
                <AlertTriangle className="h-7 w-7" aria-hidden="true" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <Badge variant={active ? "default" : "outline"}>
                {active ? "Certificat valide" : "Certificat révoqué"}
              </Badge>
              <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                {certificate.course.title}
              </h1>
              <dl className="mt-7 grid gap-5 rounded-2xl bg-muted/30 p-5 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Titulaire
                  </dt>
                  <dd className="mt-1 font-semibold">
                    {certificate.user.name ?? "Titulaire du compte vérifié"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Délivré le
                  </dt>
                  <dd className="mt-1 font-semibold">
                    {new Intl.DateTimeFormat("fr-CA", {
                      dateStyle: "long"
                    }).format(certificate.issuedAt)}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Référence
                  </dt>
                  <dd className="mt-1 break-all font-mono text-sm">
                    {certificate.id}
                  </dd>
                </div>
              </dl>
              {!active ? (
                <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-950">
                  Ce certificat a été révoqué et ne doit plus être considéré
                  comme une preuve active de réussite.
                </p>
              ) : null}
              {active && owned ? (
                <Button asChild className="mt-6">
                  <a href={`/api/lms/certificates/${certificate.id}/pdf`}>
                    <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                    Télécharger mon PDF
                  </a>
                </Button>
              ) : active ? (
                <p className="mt-5 text-sm leading-6 text-muted-foreground">
                  La vérification publique confirme uniquement l’état du
                  certificat. Le PDF est réservé à son propriétaire connecté.
                </p>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
