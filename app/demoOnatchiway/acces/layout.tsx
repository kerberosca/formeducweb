import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Démo privée Onatchiway",
  description: "Cette démonstration privée nécessite un mot de passe.",
  alternates: { canonical: "/demoOnatchiway" },
  robots: { index: false, follow: false, noarchive: true },
  openGraph: {
    type: "website",
    locale: "fr_CA",
    url: "https://formeducweb.ca/demoOnatchiway",
    siteName: "Zec Onatchiway",
    title: "Démo privée Onatchiway",
    description: "Mot de passe requis pour consulter cette démonstration.",
    images: [
      {
        url: "/demoOnatchiway/apercu-prive.png",
        width: 1200,
        height: 630,
        alt: "Démo privée Onatchiway — Mot de passe requis"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Démo privée Onatchiway",
    description: "Mot de passe requis pour consulter cette démonstration.",
    images: ["/demoOnatchiway/apercu-prive.png"]
  }
};

export default function AccessLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
