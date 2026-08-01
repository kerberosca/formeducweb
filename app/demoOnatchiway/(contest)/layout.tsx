/* eslint-disable @next/next/no-css-tags -- la feuille privée doit rester sous le chemin protégé */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "L’Appel d’Onatchiway | Grand tirage progressif",
  description:
    "Un seul gagnant remportera jusqu’à 8 168,20 $ d’équipements. Chaque billet soutient directement le territoire de l’Association Onatchiway.",
  alternates: { canonical: "/demoOnatchiway" },
  robots: { index: false, follow: false, noarchive: true },
  openGraph: {
    type: "website",
    locale: "fr_CA",
    url: "https://formeducweb.ca/demoOnatchiway",
    siteName: "Zec Onatchiway",
    title: "L’Appel d’Onatchiway",
    description:
      "Un billet à 10 $. Un seul gagnant. Jusqu’à 8 168,20 $ en équipements.",
    images: [
      {
        url: "/demoOnatchiway/og.png",
        width: 1200,
        height: 630,
        alt: "L’Appel d’Onatchiway — Grand tirage progressif"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "L’Appel d’Onatchiway",
    description:
      "Un billet à 10 $. Un seul gagnant. Jusqu’à 8 168,20 $ en équipements.",
    images: ["/demoOnatchiway/og.png"]
  }
};

export default function ContestLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <link rel="stylesheet" href="/demoOnatchiway/site.css" />
      <div className="onatchiway-app">{children}</div>
    </>
  );
}
