import Image from "next/image";
import Link from "next/link";

import { legalNavigation, siteConfig } from "@/lib/site";

const exploreLinks = [
  { href: "/services", label: "Services numériques" },
  { href: "/formations", label: "Formations" },
  { href: "/produits", label: "Produits autonomes" },
  { href: "/ressources", label: "Guides et ressources" }
];

const companyLinks = [
  { href: "/a-propos", label: "Mission et valeurs" },
  { href: "/realisations", label: "Réalisations" },
  { href: "/contact", label: "Nous joindre" },
  { href: "/formations#sur-mesure", label: "Formation sur mesure" }
];

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-[#092f5d] text-white print:hidden">
      <div className="container grid gap-10 py-14 lg:grid-cols-[1.35fr_0.8fr_0.8fr_1fr]">
        <div className="space-y-5">
          <div className="inline-flex rounded-2xl bg-white p-3 shadow-sm">
            <Image
              src="/logo-formeducweb.svg"
              alt="ForméducWeb"
              width={891}
              height={206}
              className="h-auto w-[185px]"
            />
          </div>
          <p className="max-w-sm text-base leading-7 text-white/85">
            Le numérique utile, compréhensible et abordable. Nous formons,
            conseillons et réalisons avec vous — pour que vous restiez maître de
            vos outils.
          </p>
          <p className="text-sm font-semibold text-[#8dc1ff]">
            Comprendre. Choisir. Agir.
          </p>
        </div>

        <FooterColumn title="Explorer" links={exploreLinks} />
        <FooterColumn title="ForméducWeb" links={companyLinks} />

        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white/55">
            Nous joindre
          </p>
          <div className="space-y-3 text-sm leading-6 text-white/80">
            <p>{siteConfig.territory}</p>
            <a
              href={`mailto:${siteConfig.email}`}
              className="inline-block font-semibold text-white transition hover:text-[#8dc1ff]"
            >
              {siteConfig.email}
            </a>
            <p>{siteConfig.address}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="container flex flex-col gap-4 py-6 text-xs text-white/60 lg:flex-row lg:items-center lg:justify-between">
          <p>
            © {new Date().getFullYear()} ForméducWeb. Des solutions
            proportionnées à vos besoins réels.
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {legalNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition hover:text-white"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/politique-cookies#preferences-cookies"
              className="transition hover:text-white"
            >
              Gérer mes cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links
}: {
  title: string;
  links: Array<{ href: string; label: string }>;
}) {
  return (
    <div>
      <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white/55">
        {title}
      </p>
      <div className="space-y-3 text-sm">
        {links.map((item) => (
          <div key={item.href}>
            <Link
              href={item.href}
              className="text-white/80 transition hover:text-white"
            >
              {item.label}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
