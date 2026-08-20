import Link from "next/link";
import { BookOpenCheck, LogOut, ShieldCheck, UserRound } from "lucide-react";

import { signOutAction } from "@/app/mon-espace/actions";
import { Button } from "@/components/ui/button";

export function AccountNavigation({ isAdmin }: { isAdmin: boolean }) {
  return (
    <nav
      aria-label="Espace personnel"
      className="flex flex-wrap items-center gap-2 rounded-2xl border border-border/70 bg-white/80 p-2"
    >
      <Button asChild variant="ghost" size="sm">
        <Link href="/mon-espace">
          <BookOpenCheck className="mr-2 h-4 w-4" aria-hidden="true" />
          Mon espace
        </Link>
      </Button>
      <Button asChild variant="ghost" size="sm">
        <Link href="/mon-espace/profil">
          <UserRound className="mr-2 h-4 w-4" aria-hidden="true" />
          Profil
        </Link>
      </Button>
      {isAdmin ? (
        <Button asChild variant="ghost" size="sm">
          <Link href="/administration">
            <ShieldCheck className="mr-2 h-4 w-4" aria-hidden="true" />
            Administration
          </Link>
        </Button>
      ) : null}
      <form action={signOutAction} className="ml-auto">
        <Button type="submit" variant="ghost" size="sm">
          <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
          Déconnexion
        </Button>
      </form>
    </nav>
  );
}
