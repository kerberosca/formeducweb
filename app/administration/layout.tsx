import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { auth } from "@/auth";
import { AdminNavigation } from "@/components/admin/admin-navigation";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AdministrationLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/administration");
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, isActive: true }
  });
  if (!user?.isActive || user.role !== "admin") redirect("/mon-espace");
  return (
    <div className="container py-10 md:py-14">
      <AdminNavigation />
      <div className="mt-8">{children}</div>
    </div>
  );
}
