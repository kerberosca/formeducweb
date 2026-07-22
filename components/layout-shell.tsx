"use client";

import { usePathname } from "next/navigation";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/Demo839web" || pathname.startsWith("/Demo839web/")) {
    return children;
  }

  return (
    <>
      <a
        href="#contenu-principal"
        className="sr-only z-[100] rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Aller au contenu
      </a>
      <div className="relative flex min-h-screen flex-col">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-[radial-gradient(circle_at_top,rgba(21,113,212,0.16),transparent_50%)]" />
        <SiteHeader />
        <main
          id="contenu-principal"
          tabIndex={-1}
          className="relative z-10 flex-1"
        >
          {children}
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
