import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Award,
  BookOpenCheck,
  CheckCircle2,
  Clock3,
  CreditCard,
  Play
} from "lucide-react";

import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Mon espace",
  robots: { index: false, follow: false }
};

function dateLabel(date: Date) {
  return new Intl.DateTimeFormat("fr-CA", { dateStyle: "medium" }).format(date);
}

export default async function AccountPage({
  searchParams
}: {
  searchParams: Promise<{ paiement?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/mon-espace");
  const [user, params] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      include: {
        enrollments: {
          orderBy: { updatedAt: "desc" },
          include: {
            course: true,
            certificate: {
              select: { token: true, issuedAt: true, revokedAt: true }
            }
          }
        },
        orders: {
          where: { kind: "course" },
          orderBy: { createdAt: "desc" },
          include: { course: { select: { title: true, slug: true } } }
        },
        certificates: {
          orderBy: { issuedAt: "desc" },
          include: { course: { select: { title: true } } }
        }
      }
    }),
    searchParams
  ]);
  if (!user?.isActive) redirect("/connexion?erreur=compte");

  return (
    <>
      {params.paiement === "confirme" ? (
        <div
          className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950"
          role="status"
        >
          <p className="font-semibold">Paiement reçu</p>
          <p className="mt-1 text-sm">
            L’accès apparaît dès que Stripe confirme le paiement. Actualisez
            cette page dans quelques secondes au besoin.
          </p>
        </div>
      ) : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Espace apprenant</p>
          <h1 className="mt-2 font-heading text-4xl font-semibold tracking-tight">
            Bonjour{user.name ? `, ${user.name}` : ""}
          </h1>
          <p className="mt-3 text-muted-foreground">
            Reprenez vos formations, suivez votre progression et retrouvez vos
            achats.
          </p>
        </div>
        <Button asChild variant="secondary">
          <Link href="/formations">Explorer les formations</Link>
        </Button>
      </div>

      <section className="mt-10" aria-labelledby="mes-formations">
        <div className="flex items-center gap-3">
          <BookOpenCheck className="h-6 w-6 text-primary" aria-hidden="true" />
          <h2
            id="mes-formations"
            className="font-heading text-2xl font-semibold"
          >
            Mes formations
          </h2>
        </div>
        {user.enrollments.length ? (
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            {user.enrollments.map((enrollment) => (
              <Card key={enrollment.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Badge
                        variant={
                          enrollment.status === "active" &&
                          !enrollment.revokedAt
                            ? "default"
                            : "outline"
                        }
                      >
                        {enrollment.completedAt
                          ? "Terminée"
                          : enrollment.revokedAt
                            ? "Accès révoqué"
                            : "En cours"}
                      </Badge>
                      <h3 className="mt-3 font-heading text-xl font-semibold">
                        {enrollment.course.shortTitle}
                      </h3>
                    </div>
                    <span className="text-lg font-semibold text-primary">
                      {enrollment.progressPercent} %
                    </span>
                  </div>
                  <Progress
                    className="mt-5"
                    value={enrollment.progressPercent}
                    aria-label={`${enrollment.progressPercent} % terminé`}
                  />
                  <div className="mt-5 flex flex-wrap gap-3">
                    {enrollment.status === "active" && !enrollment.revokedAt ? (
                      <Button asChild size="sm">
                        <Link
                          href={`/formations/${enrollment.course.slug}/apprendre`}
                        >
                          <Play className="mr-2 h-4 w-4" aria-hidden="true" />
                          {enrollment.progressPercent
                            ? "Reprendre"
                            : "Commencer"}
                        </Link>
                      </Button>
                    ) : null}
                    {enrollment.certificate &&
                    !enrollment.certificate.revokedAt ? (
                      <Button asChild size="sm" variant="secondary">
                        <Link
                          href={`/certificats/verifier/${enrollment.certificate.token}`}
                        >
                          <Award className="mr-2 h-4 w-4" aria-hidden="true" />
                          Certificat
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="mt-5">
            <CardContent className="p-8 text-center">
              <p className="font-semibold">
                Aucune formation inscrite pour le moment.
              </p>
              <Button asChild className="mt-4">
                <Link href="/formations">Choisir une formation</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="mes-achats">
          <Card>
            <CardHeader>
              <CardTitle id="mes-achats" className="flex items-center gap-2">
                <CreditCard
                  className="h-5 w-5 text-primary"
                  aria-hidden="true"
                />
                Mes achats
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.orders.length ? (
                <ul className="divide-y divide-border/70">
                  {user.orders.map((order) => (
                    <li key={order.id} className="py-4 first:pt-0">
                      <div className="flex justify-between gap-4">
                        <div>
                          <p className="font-semibold">
                            {order.course?.title ?? order.productCode}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {dateLabel(order.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {new Intl.NumberFormat("fr-CA", {
                              style: "currency",
                              currency: order.currency.toUpperCase()
                            }).format(order.amountCents / 100)}
                          </p>
                          <Badge variant="outline">
                            {order.status === "paid"
                              ? "Payé"
                              : order.status === "refunded"
                                ? "Remboursé"
                                : "En attente"}
                          </Badge>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Aucun achat de formation associé à ce compte.
                </p>
              )}
            </CardContent>
          </Card>
        </section>
        <section aria-labelledby="mes-certificats">
          <Card>
            <CardHeader>
              <CardTitle
                id="mes-certificats"
                className="flex items-center gap-2"
              >
                <Award className="h-5 w-5 text-primary" aria-hidden="true" />
                Mes certificats
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.certificates.length ? (
                <ul className="space-y-4">
                  {user.certificates.map((certificate) => (
                    <li
                      key={certificate.id}
                      className="rounded-xl border border-border/70 p-4"
                    >
                      <div className="flex gap-3">
                        <CheckCircle2
                          className="h-5 w-5 shrink-0 text-primary"
                          aria-hidden="true"
                        />
                        <div>
                          <p className="font-semibold">
                            {certificate.course.title}
                          </p>
                          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock3
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                            Délivré le {dateLabel(certificate.issuedAt)}
                          </p>
                          {certificate.revokedAt ? (
                            <Badge variant="outline" className="mt-2">
                              Révoqué
                            </Badge>
                          ) : (
                            <Link
                              className="mt-2 inline-block text-sm font-semibold text-primary underline"
                              href={`/certificats/verifier/${certificate.token}`}
                            >
                              Voir et télécharger
                            </Link>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Les certificats obtenus apparaîtront ici.
                </p>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </>
  );
}
