import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Commandes LMS — Administration",
  robots: { index: false, follow: false }
};

export default async function OrdersAdminPage() {
  const orders = await db.order.findMany({
    where: { kind: "course" },
    orderBy: { createdAt: "desc" },
    take: 250,
    include: {
      user: { select: { name: true, email: true } },
      course: { select: { title: true } },
      entitlements: { take: 1 },
      enrollment: true
    }
  });

  return (
    <>
      <p className="eyebrow">Commerce LMS</p>
      <h1 className="mt-2 font-heading text-4xl font-semibold">Commandes</h1>
      <p className="mt-3 text-muted-foreground">
        Les montants affichés proviennent des commandes serveur. Les
        remboursements conservent la progression et révoquent l’accès.
      </p>
      <div className="mt-7 overflow-x-auto rounded-2xl border border-border/70 bg-white">
        <table className="w-full min-w-[940px] text-left text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="p-4">Date</th>
              <th className="p-4">Client</th>
              <th className="p-4">Formation</th>
              <th className="p-4">Montant</th>
              <th className="p-4">État</th>
              <th className="p-4">Accès</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/70">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="p-4">
                  {new Intl.DateTimeFormat("fr-CA", {
                    dateStyle: "medium"
                  }).format(order.createdAt)}
                </td>
                <td className="p-4">
                  <p className="font-semibold">
                    {order.user?.name ?? order.contactName ?? "Sans nom"}
                  </p>
                  <p className="text-muted-foreground">
                    {order.user?.email ?? order.email}
                  </p>
                </td>
                <td className="p-4">
                  {order.course?.title ?? order.productCode}
                </td>
                <td className="p-4 font-semibold">
                  {new Intl.NumberFormat("fr-CA", {
                    style: "currency",
                    currency: order.currency.toUpperCase()
                  }).format(order.amountCents / 100)}
                </td>
                <td className="p-4">
                  <Badge
                    variant={order.status === "paid" ? "default" : "outline"}
                  >
                    {order.status}
                  </Badge>
                </td>
                <td className="p-4">
                  {order.entitlements[0]?.status ?? "—"}
                  {order.enrollment ? " · inscrit" : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
