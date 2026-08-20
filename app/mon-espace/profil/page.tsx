import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckCircle2, Mail, UserRound } from "lucide-react";

import { auth } from "@/auth";
import { updateProfileAction } from "@/app/mon-espace/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Mon profil",
  robots: { index: false, follow: false }
};

export default async function ProfilePage({
  searchParams
}: {
  searchParams: Promise<{ statut?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/mon-espace/profil");
  const [user, params] = await Promise.all([
    db.user.findUnique({ where: { id: session.user.id } }),
    searchParams
  ]);
  if (!user?.isActive) redirect("/connexion?erreur=compte");
  return (
    <div className="mx-auto max-w-2xl">
      <p className="eyebrow">Compte</p>
      <h1 className="mt-2 font-heading text-4xl font-semibold">Mon profil</h1>
      <p className="mt-3 text-muted-foreground">
        Votre courriel vérifié sert à vous connecter et à rattacher vos achats.
      </p>
      {params.statut === "enregistre" ? (
        <p
          className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-950"
          role="status"
        >
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          Profil enregistré.
        </p>
      ) : null}
      <Card className="mt-7">
        <CardHeader>
          <CardTitle>Renseignements</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateProfileAction} className="space-y-5">
            <div>
              <Label htmlFor="name">Nom affiché</Label>
              <div className="relative mt-2">
                <UserRound
                  className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="name"
                  name="name"
                  maxLength={100}
                  defaultValue={user.name ?? ""}
                  className="pl-11"
                  autoComplete="name"
                />
              </div>
            </div>
            <div>
              <Label>Adresse courriel</Label>
              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-border/70 bg-muted/30 px-4 py-3">
                <Mail className="h-4 w-4 text-primary" aria-hidden="true" />
                <span>{user.email}</span>
                {user.emailVerified ? (
                  <span className="ml-auto text-xs font-semibold text-emerald-700">
                    Vérifiée
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Le changement de courriel n’est pas offert en libre-service afin
                de protéger vos accès et achats.
              </p>
            </div>
            <Button type="submit">Enregistrer le profil</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
