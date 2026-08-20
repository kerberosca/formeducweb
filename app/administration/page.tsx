import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpenCheck,
  ClipboardList,
  CreditCard,
  FileClock,
  Users
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Administration LMS",
  robots: { index: false, follow: false }
};

export default async function AdministrationPage() {
  const [courses, enrollments, users, orders, drafts] = await Promise.all([
    db.course.count({ where: { archivedAt: null } }),
    db.enrollment.count({ where: { status: "active", revokedAt: null } }),
    db.user.count({ where: { isActive: true } }),
    db.order.count({ where: { kind: "course" } }),
    db.course.count({
      where: { status: { in: ["draft", "preparation"] }, archivedAt: null }
    })
  ]);
  const cards = [
    {
      href: "/administration/formations",
      label: "Formations",
      value: courses,
      icon: BookOpenCheck
    },
    {
      href: "/administration/inscriptions",
      label: "Inscriptions actives",
      value: enrollments,
      icon: ClipboardList
    },
    {
      href: "/administration/utilisateurs",
      label: "Utilisateurs actifs",
      value: users,
      icon: Users
    },
    {
      href: "/administration/commandes",
      label: "Commandes LMS",
      value: orders,
      icon: CreditCard
    },
    {
      href: "/administration/formations",
      label: "À compléter",
      value: drafts,
      icon: FileClock
    }
  ];
  return (
    <>
      <p className="eyebrow">LMS</p>
      <h1 className="mt-2 font-heading text-4xl font-semibold">
        Administration
      </h1>
      <p className="mt-3 text-muted-foreground">
        Gérez les contenus, les accès et le commerce des formations. Chaque
        mutation sensible est journalisée.
      </p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <Link key={card.label} href={card.href}>
            <Card className="h-full transition hover:border-primary/40">
              <CardContent className="p-6">
                <card.icon
                  className="h-6 w-6 text-primary"
                  aria-hidden="true"
                />
                <p className="mt-4 text-3xl font-semibold">{card.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {card.label}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
