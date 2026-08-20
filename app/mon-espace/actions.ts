"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth, signOut } from "@/auth";
import { db } from "@/lib/db";

const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .max(100)
    .transform((value) => value || null)
});

async function requireCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/mon-espace");
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user?.isActive) redirect("/connexion?erreur=compte");
  return user;
}

export async function updateProfileAction(formData: FormData) {
  const user = await requireCurrentUser();
  const input = profileSchema.parse({ name: formData.get("name") });
  await db.user.update({ where: { id: user.id }, data: { name: input.name } });
  revalidatePath("/mon-espace");
  revalidatePath("/mon-espace/profil");
  redirect("/mon-espace/profil?statut=enregistre");
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
