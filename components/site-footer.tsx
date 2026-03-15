import Image from "next/image";
import Link from "next/link";

import { legalNavigation, mainNavigation, siteConfig } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-[#0B392E] text-white print:hidden">
      <div className="container grid gap-10 py-14 md:grid-cols-[1.3fr_1fr_1fr]">
        <div className="space-y-4">
          <div className="inline-flex rounded-2xl bg-white/95 p-3">
            <Image
              src="/logo-formeducweb.svg"
              alt="ForméducWeb"
              width={891}
              height={206}
              className="h-auto w-[180px]"
            />
          </div>
          <p className="max-w-md text-sm leading-7 text-white/80">
            Diagnostic, alignement, plan d&apos;action et implantation pour les PME et OBNL qui veulent avancer simplement.
          </p>
          <p className="text-sm text-white/70">{siteConfig.territory}</p>
        </div>

        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-white/60">Navigation</p>
          <div className="space-y-3 text-sm">
            {mainNavigation.map((item) => (
              <div key={item.href}>
                <Link href={item.href} className="text-white/80 transition hover:text-white">
                  {item.label}
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-white/60">Coordonnées</p>
          <div className="space-y-3 text-sm text-white/80">
            <p>{siteConfig.address}</p>
            <p>{siteConfig.phone}</p>
            <p>{siteConfig.email}</p>
          </div>
          <div className="mt-6 space-y-2 text-sm">
            {legalNavigation.map((item) => (
              <div key={item.href}>
                <Link href={item.href} className="text-white/65 transition hover:text-white">
                  {item.label}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
