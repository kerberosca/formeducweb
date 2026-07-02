import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { mainNavigation } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/85 backdrop-blur-xl print:hidden">
      <div className="container py-4">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div>
              <Image
                src="/logo-formeducweb.svg"
                alt="ForméducWeb"
                width={891}
                height={206}
                priority
                className="h-auto w-[170px] sm:w-[230px]"
              />
              <p className="mt-1 text-xs text-muted-foreground">Hygiène informatique, Loi 25, cyber et IA</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <nav aria-label="Navigation principale" className="hidden items-center gap-8 md:flex">
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

            <Button asChild size="sm" className="md:hidden">
              <Link href="/#diagnostics">Auto-évaluation</Link>
            </Button>

            <Button asChild className="hidden md:inline-flex">
              <Link href="/#diagnostics">Choisir un diagnostic</Link>
            </Button>
          </div>
        </div>

        <nav aria-label="Navigation mobile" className="mt-4 flex flex-wrap gap-4 md:hidden">
          {mainNavigation.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-medium text-foreground/80 transition hover:text-primary">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
