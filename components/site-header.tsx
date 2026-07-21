"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { mainNavigation } from "@/lib/site";

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMobileOpen(false);
      window.setTimeout(() => menuButtonRef.current?.focus(), 0);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/90 backdrop-blur-xl print:hidden">
      <div className="container py-3 md:py-4">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="flex items-center gap-3"
            onClick={() => setMobileOpen(false)}
          >
            <div>
              <Image
                src="/logo-formeducweb.svg"
                alt="ForméducWeb"
                width={891}
                height={206}
                priority
                className="h-auto w-[155px] sm:w-[205px] md:w-[230px]"
              />
              <p className="mt-1 hidden text-xs text-muted-foreground sm:block">
                Hygiène informatique, Loi 25, cyber et IA
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2 md:gap-3">
            <nav
              aria-label="Navigation principale"
              className="hidden items-center gap-7 md:flex"
            >
              {mainNavigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-foreground/80 transition hover:text-primary"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <Button asChild className="hidden md:inline-flex">
              <Link href="/#diagnostics">Choisir un diagnostic</Link>
            </Button>

            <Button
              ref={menuButtonRef}
              type="button"
              size="sm"
              variant="secondary"
              className="md:hidden"
              aria-expanded={mobileOpen}
              aria-controls="navigation-mobile"
              aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
              onClick={() => setMobileOpen((current) => !current)}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
              <span className="ml-2">Menu</span>
            </Button>
          </div>
        </div>

        {mobileOpen ? (
          <nav
            id="navigation-mobile"
            aria-label="Navigation mobile"
            className="mt-3 grid gap-1 border-t border-border/60 pt-3 md:hidden"
          >
            {mainNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/85 transition hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Button asChild className="mt-2 w-full">
              <Link href="/#diagnostics" onClick={() => setMobileOpen(false)}>
                Commencer un diagnostic gratuit
              </Link>
            </Button>
          </nav>
        ) : null}
      </div>
    </header>
  );
}
