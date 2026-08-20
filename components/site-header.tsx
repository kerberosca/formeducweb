"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { serviceNavigation } from "@/lib/services";
import { mainNavigation } from "@/lib/site";

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const servicesButtonRef = useRef<HTMLButtonElement>(null);
  const servicesGroupRef = useRef<HTMLDivElement>(null);
  const servicesMenuRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

  const isCurrent = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const closeMobileMenu = () => {
    setMobileOpen(false);
    setMobileServicesOpen(false);
  };

  useEffect(() => {
    if (!mobileOpen && !servicesOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      if (servicesOpen) {
        setServicesOpen(false);
        window.setTimeout(() => servicesButtonRef.current?.focus(), 0);
        return;
      }

      closeMobileMenu();
      window.setTimeout(() => menuButtonRef.current?.focus(), 0);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [mobileOpen, servicesOpen]);

  useEffect(() => {
    if (!servicesOpen) return;

    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !servicesGroupRef.current?.contains(event.target)
      ) {
        setServicesOpen(false);
      }
    };

    window.addEventListener("pointerdown", closeOnOutsidePointer);
    return () =>
      window.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, [servicesOpen]);

  const focusFirstService = () => {
    window.setTimeout(() => {
      servicesMenuRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    }, 0);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-xl print:hidden">
      <div className="container py-3">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="flex items-center gap-3"
            onClick={() => {
              setServicesOpen(false);
              closeMobileMenu();
            }}
          >
            <div className="min-w-0">
              <Image
                src="/logo-formeducweb.svg"
                alt="ForméducWeb"
                width={891}
                height={206}
                priority
                className="h-auto w-[150px] sm:w-[180px] xl:w-[205px]"
              />
              <p className="mt-0.5 hidden text-[0.68rem] font-medium tracking-wide text-muted-foreground sm:block">
                Formation · solutions · autonomie
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <nav
              aria-label="Navigation principale"
              className="hidden items-center gap-0.5 xl:flex"
            >
              {mainNavigation.map((item) =>
                item.href === "/services" ? (
                  <div
                    key={item.href}
                    ref={servicesGroupRef}
                    className={`relative flex items-center rounded-full transition ${
                      isCurrent(item.href)
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/75 hover:bg-white hover:text-primary"
                    }`}
                    onBlur={(event) => {
                      if (!event.currentTarget.contains(event.relatedTarget)) {
                        setServicesOpen(false);
                      }
                    }}
                  >
                    <Link
                      href={item.href}
                      aria-current={isCurrent(item.href) ? "page" : undefined}
                      className="rounded-l-full py-2 pl-3 pr-1 text-sm font-semibold"
                      onClick={() => setServicesOpen(false)}
                    >
                      {item.label}
                    </Link>
                    <button
                      ref={servicesButtonRef}
                      type="button"
                      aria-label="Afficher les services"
                      aria-expanded={servicesOpen}
                      aria-controls="services-submenu"
                      className="mr-1 flex rounded-full p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      onClick={() => setServicesOpen((current) => !current)}
                      onKeyDown={(event) => {
                        if (event.key !== "ArrowDown") return;
                        event.preventDefault();
                        setServicesOpen(true);
                        focusFirstService();
                      }}
                    >
                      <ChevronDown
                        aria-hidden="true"
                        className={`h-4 w-4 transition ${
                          servicesOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {servicesOpen ? (
                      <nav
                        ref={servicesMenuRef}
                        id="services-submenu"
                        aria-label="Services"
                        className="absolute left-0 top-[calc(100%+0.75rem)] z-50 grid w-[340px] gap-1 rounded-[24px] border border-border/70 bg-background p-3 shadow-xl"
                      >
                        {serviceNavigation.map((service) => (
                          <Link
                            key={service.slug}
                            href={service.href}
                            aria-current={
                              pathname === service.href ? "page" : undefined
                            }
                            className="rounded-2xl px-4 py-3 text-sm font-semibold text-foreground/85 transition hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            onClick={() => setServicesOpen(false)}
                          >
                            {service.shortTitle}
                          </Link>
                        ))}
                      </nav>
                    ) : null}
                  </div>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isCurrent(item.href) ? "page" : undefined}
                    className={`rounded-full px-2.5 py-2 text-sm font-semibold transition ${
                      isCurrent(item.href)
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/75 hover:bg-white hover:text-primary"
                    }`}
                    onClick={() => setServicesOpen(false)}
                  >
                    {item.label}
                  </Link>
                )
              )}
            </nav>

            <Button
              asChild
              size="sm"
              variant="ghost"
              className="hidden xl:inline-flex"
            >
              <Link href="/recherche" aria-label="Rechercher sur le site">
                <Search aria-hidden="true" className="h-4 w-4" />
                <span className="sr-only">Rechercher sur le site</span>
              </Link>
            </Button>

            <Button asChild className="hidden xl:inline-flex">
              <Link href="/contact?source=entete">Parler de votre besoin</Link>
            </Button>

            <Button
              asChild
              size="sm"
              variant="secondary"
              className="hidden xl:inline-flex"
            >
              <Link href="/mon-espace">Mon espace</Link>
            </Button>

            <Button
              ref={menuButtonRef}
              type="button"
              size="sm"
              variant="secondary"
              className="xl:hidden"
              aria-expanded={mobileOpen}
              aria-controls="navigation-mobile"
              aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
              onClick={() => {
                setMobileOpen((current) => !current);
                setMobileServicesOpen(false);
              }}
            >
              {mobileOpen ? (
                <X aria-hidden="true" className="h-5 w-5" />
              ) : (
                <Menu aria-hidden="true" className="h-5 w-5" />
              )}
              <span className="ml-2">Menu</span>
            </Button>
          </div>
        </div>

        {mobileOpen ? (
          <nav
            id="navigation-mobile"
            aria-label="Navigation mobile"
            className="mt-3 grid gap-1 border-t border-border/60 pt-3 xl:hidden"
          >
            {mainNavigation.map((item) =>
              item.href === "/services" ? (
                <div key={item.href} className="rounded-xl">
                  <div
                    className={`flex items-center rounded-xl ${
                      isCurrent(item.href)
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/85"
                    }`}
                  >
                    <Link
                      href={item.href}
                      aria-current={isCurrent(item.href) ? "page" : undefined}
                      className="flex-1 rounded-l-xl px-3 py-2.5 text-sm font-semibold hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      onClick={closeMobileMenu}
                    >
                      {item.label}
                    </Link>
                    <button
                      type="button"
                      aria-label="Afficher les services"
                      aria-expanded={mobileServicesOpen}
                      aria-controls="services-submenu-mobile"
                      className="mr-2 rounded-lg p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      onClick={() =>
                        setMobileServicesOpen((current) => !current)
                      }
                    >
                      <ChevronDown
                        aria-hidden="true"
                        className={`h-4 w-4 transition ${
                          mobileServicesOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>

                  {mobileServicesOpen ? (
                    <div
                      id="services-submenu-mobile"
                      className="ml-4 mt-1 grid gap-1 border-l border-border/80 pl-3"
                    >
                      {serviceNavigation.map((service) => (
                        <Link
                          key={service.slug}
                          href={service.href}
                          aria-current={
                            pathname === service.href ? "page" : undefined
                          }
                          className="rounded-xl px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          onClick={closeMobileMenu}
                        >
                          {service.shortTitle}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isCurrent(item.href) ? "page" : undefined}
                  className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    isCurrent(item.href)
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/85 hover:bg-primary/5 hover:text-primary"
                  }`}
                  onClick={closeMobileMenu}
                >
                  {item.label}
                </Link>
              )
            )}

            <Button asChild variant="secondary" className="mt-2 w-full">
              <Link href="/recherche" onClick={closeMobileMenu}>
                <Search aria-hidden="true" className="mr-2 h-4 w-4" />
                Rechercher sur le site
              </Link>
            </Button>
            <Button asChild variant="secondary" className="w-full">
              <Link href="/mon-espace" onClick={closeMobileMenu}>
                Mon espace
              </Link>
            </Button>
            <Button asChild className="w-full">
              <Link
                href="/contact?source=menu-mobile"
                onClick={closeMobileMenu}
              >
                Parler de votre besoin
              </Link>
            </Button>
          </nav>
        ) : null}
      </div>
    </header>
  );
}
