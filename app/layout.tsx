import type { Metadata } from "next";
import { Space_Grotesk, Source_Sans_3 } from "next/font/google";
import { Suspense } from "react";

import { CookieConsentBanner } from "@/components/cookies/cookie-consent-banner";
import { OptionalTrackers } from "@/components/cookies/optional-trackers";
import { JsonLd } from "@/components/seo/json-ld";
import { AttributionBootstrap } from "@/components/analytics/attribution-bootstrap";
import { AppToaster } from "@/components/ui/sonner";
import { LayoutShell } from "@/components/layout-shell";
import { getAbsoluteUrl, getSiteUrl } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

import "./globals.css";

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["500", "700"]
});

const bodyFont = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "600", "700"]
});

const siteUrl = getSiteUrl();
const siteName = "ForméducWeb";
const logoUrl = getAbsoluteUrl("/logo-formeducweb.svg");
const socialImageUrl = getAbsoluteUrl("/og.png");

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteName,
  description: siteConfig.description,
  url: siteUrl,
  logo: logoUrl,
  email: siteConfig.email,
  areaServed: {
    "@type": "AdministrativeArea",
    name: "Québec"
  },
  knowsAbout: [
    "Formation numérique",
    "Création de sites Web",
    "Automatisation des processus",
    "Soutien informatique",
    "Cybersécurité",
    "Intelligence artificielle"
  ],
  address: {
    "@type": "PostalAddress",
    streetAddress: "101-5121 av. Chauveau Ouest",
    addressLocality: "Québec",
    addressRegion: "QC",
    postalCode: "G2E 5A6",
    addressCountry: "CA"
  }
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteName,
  url: siteUrl,
  inLanguage: "fr-CA",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${getAbsoluteUrl("/recherche")}?q={search_term_string}`
    },
    "query-input": "required name=search_term_string"
  }
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ForméducWeb — Le numérique utile, à votre portée",
    template: `%s | ${siteName}`
  },
  description: siteConfig.description,
  keywords: [
    "formation numérique Québec",
    "création site web PME",
    "automatisation entreprise",
    "formation intelligence artificielle",
    "soutien informatique PME",
    "Excel et Word",
    "cybersécurité PME"
  ],
  openGraph: {
    title: siteName,
    description: siteConfig.description,
    url: getAbsoluteUrl("/"),
    siteName,
    locale: "fr_CA",
    type: "website",
    images: [
      {
        url: socialImageUrl,
        width: 1200,
        height: 630,
        alt: `${siteName} — formation, solutions numériques et autonomie`
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteConfig.description,
    images: [socialImageUrl]
  }
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr-CA"
      className={`${headingFont.variable} ${bodyFont.variable}`}
    >
      <body>
        <LayoutShell>{children}</LayoutShell>
        <Suspense fallback={null}>
          <OptionalTrackers />
        </Suspense>
        <AttributionBootstrap />
        <CookieConsentBanner />
        <AppToaster />
        <JsonLd id="organization-schema" value={organizationSchema} />
        <JsonLd id="website-schema" value={websiteSchema} />
      </body>
    </html>
  );
}
