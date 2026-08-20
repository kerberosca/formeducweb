import { auth } from "@/auth";
import { db } from "@/lib/db";
import { LmsError } from "@/lib/lms/errors";

type LmsSession = {
  user?: {
    id?: string;
    email?: string | null;
  };
} | null;

export async function getAuthenticatedLmsUser() {
  const session = (await auth()) as LmsSession;
  const sessionUser = session?.user;

  if (!sessionUser?.id && !sessionUser?.email) {
    throw new LmsError(
      401,
      "Connectez-vous pour accéder à votre formation.",
      "authentication_required"
    );
  }

  const user = sessionUser.id
    ? await db.user.findUnique({ where: { id: sessionUser.id } })
    : await db.user.findUnique({
        where: { email: sessionUser.email!.trim().toLowerCase() }
      });

  if (!user) {
    throw new LmsError(401, "La session est invalide.", "invalid_session");
  }

  if (!user.isActive) {
    throw new LmsError(403, "Ce compte est inactif.", "inactive_account");
  }

  if (!user.email || !user.emailVerified) {
    throw new LmsError(
      403,
      "L’adresse courriel du compte doit être vérifiée.",
      "email_not_verified"
    );
  }

  return user;
}
