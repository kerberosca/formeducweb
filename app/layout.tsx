import type { Metadata } from "next";
import { Space_Grotesk, Source_Sans_3 } from "next/font/google";

import { CookieConsentBanner } from "@/components/cookies/cookie-consent-banner";
import { OptionalTrackers } from "@/components/cookies/optional-trackers";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { AppToaster } from "@/components/ui/sonner";
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

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ForméducWeb",
    template: "%s | ForméducWeb"
  },
  description: siteConfig.description,
  openGraph: {
    title: "ForméducWeb",
    description: siteConfig.description,
    locale: "fr_CA",
    type: "website"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr-CA" className={`${headingFont.variable} ${bodyFont.variable}`}>
      <body>
        <div className="relative flex min-h-screen flex-col">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-[radial-gradient(circle_at_top,rgba(11,57,46,0.15),transparent_50%)]" />
          <SiteHeader />
          <main className="relative z-10 flex-1">{children}</main>
          <SiteFooter />
        </div>
        <OptionalTrackers />
        <CookieConsentBanner />
        <AppToaster />
      </body>
    </html>
  );
}
