import type { Metadata } from "next";

import { updateUserAccessAction } from "@/app/administration/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Utilisateurs — Administration",
  robots: { index: false, follow: false }
};
const selectClass =
  "h-9 rounded-xl border border-input bg-background px-3 text-sm";

export default async function UsersAdminPage() {
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 250,
    include: { _count: { select: { enrollments: true, orders: true } } }
  });
  return (
    <>
      <p className="eyebrow">Comptes</p>
      <h1 className="mt-2 font-heading text-4xl font-semibold">Utilisateurs</h1>
      <p className="mt-3 max-w-3xl text-muted-foreground">
        Le dernier administrateur actif ne peut pas être désactivé ni
        rétrogradé.
      </p>
      <div className="mt-7 overflow-x-auto rounded-2xl border border-border/70 bg-white">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="p-4">Utilisateur</th>
              <th className="p-4">Courriel</th>
              <th className="p-4">Activité</th>
              <th className="p-4">Accès</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/70">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="p-4">
                  <p className="font-semibold">{user.name ?? "Sans nom"}</p>
                  <p className="mt-1">
                    <Badge
                      variant={user.role === "admin" ? "default" : "outline"}
                    >
                      {user.role}
                    </Badge>
                  </p>
                </td>
                <td className="p-4">
                  <p>{user.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {user.emailVerified ? "Vérifié" : "Non vérifié"}
                  </p>
                </td>
                <td className="p-4">
                  {user._count.enrollments} formation(s) · {user._count.orders}{" "}
                  commande(s)
                </td>
                <td className="p-4">
                  <form
                    action={updateUserAccessAction}
                    className="flex items-center gap-2"
                  >
                    <input type="hidden" name="userId" value={user.id} />
                    <select
                      name="role"
                      defaultValue={user.role}
                      className={selectClass}
                    >
                      <option value="learner">Apprenant</option>
                      <option value="admin">Administrateur</option>
                    </select>
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        name="isActive"
                        defaultChecked={user.isActive}
                      />
                      Actif
                    </label>
                    <Button type="submit" size="sm" variant="secondary">
                      Enregistrer
                    </Button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
