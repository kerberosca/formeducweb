import type { Metadata } from "next";
import { Space_Grotesk, Source_Sans_3 } from "next/font/google";
import { Suspense } from "react";

import { CookieConsentBanner } from "@/components/cookies/cookie-consent-banner";
import { OptionalTrackers } from "@/components/cookies/optional-trackers";
import { JsonLd } from "@/components/seo/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { AttributionBootstrap } from "@/components/analytics/attribution-bootstrap";
import { AppToaster } from "@/components/ui/sonner";
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

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteName,
  url: siteUrl,
  logo: logoUrl,
  email: siteConfig.email,
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
  inLanguage: "fr-CA"
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`
  },
  description: siteConfig.description,
  alternates: {
    canonical: getAbsoluteUrl("/")
  },
  openGraph: {
    title: siteName,
    description: siteConfig.description,
    url: getAbsoluteUrl("/"),
    siteName,
    locale: "fr_CA",
    type: "website",
    images: [
      {
        url: logoUrl,
        alt: siteName
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteConfig.description,
    images: [logoUrl]
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr-CA" className={`${headingFont.variable} ${bodyFont.variable}`}>
      <body>
        <div className="relative flex min-h-screen flex-col">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-[radial-gradient(circle_at_top,rgba(21,113,212,0.16),transparent_50%)]" />
          <SiteHeader />
          <main className="relative z-10 flex-1">{children}</main>
          <SiteFooter />
        </div>
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
