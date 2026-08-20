import Link from "next/link";
import {
  BookCopy,
  ClipboardList,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  Users
} from "lucide-react";

const links = [
  { href: "/administration", label: "Vue d’ensemble", icon: LayoutDashboard },
  {
    href: "/administration/formations",
    label: "Formations",
    icon: GraduationCap
  },
  {
    href: "/administration/inscriptions",
    label: "Inscriptions",
    icon: ClipboardList
  },
  { href: "/administration/utilisateurs", label: "Utilisateurs", icon: Users },
  { href: "/administration/commandes", label: "Commandes", icon: CreditCard }
] as const;

export function AdminNavigation() {
  return (
    <nav
      aria-label="Administration"
      className="flex flex-wrap gap-2 rounded-2xl border border-border/70 bg-white/85 p-2"
    >
      {links.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold text-foreground/75 transition hover:bg-primary/10 hover:text-primary"
        >
          <item.icon className="mr-2 h-4 w-4" aria-hidden="true" />
          {item.label}
        </Link>
      ))}
      <Link
        href="/mon-espace"
        className="ml-auto inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold text-primary"
      >
        <BookCopy className="mr-2 h-4 w-4" aria-hidden="true" />
        Mon espace
      </Link>
    </nav>
  );
}
