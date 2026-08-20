import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getSafeAuthCallbackPath } from "@/lib/auth-config";
import { db } from "@/lib/db";

export async function getAuthenticatedUser() {
  const session = await auth();
  if (!session?.user?.id) return null;

  return db.user.findFirst({
    where: { id: session.user.id, isActive: true }
  });
}

export async function requireAuthenticatedUser(callbackPath = "/mon-espace") {
  const user = await getAuthenticatedUser();
  if (user) return user;

  const safeCallbackPath = getSafeAuthCallbackPath(callbackPath);
  redirect(`/connexion?callbackUrl=${encodeURIComponent(safeCallbackPath)}`);
}

export async function requireAdminUser(callbackPath = "/administration") {
  const user = await requireAuthenticatedUser(callbackPath);
  if (user.role === "admin") return user;

  redirect("/mon-espace");
}
