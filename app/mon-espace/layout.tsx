import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { auth } from "@/auth";
import { AccountNavigation } from "@/components/lms/account-navigation";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AccountLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/mon-espace");
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, isActive: true }
  });
  if (!user?.isActive) redirect("/connexion?erreur=compte");
  return (
    <div className="container py-10 md:py-14">
      <AccountNavigation isAdmin={user.role === "admin"} />
      <div className="mt-8">{children}</div>
    </div>
  );
}
