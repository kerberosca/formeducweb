import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Escadron 839 | Lions de Chibougamau",
    template: "%s | Escadron 839",
  },
  description:
    "Démonstration de l’Escadron 839 : activités, communications, calendrier et inscription.",
  robots: { index: false, follow: false, noarchive: true },
};

export default function Demo839Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <link rel="stylesheet" href="/Demo839web/site.css" />
      <div className="demo839-app">{children}</div>
    </>
  );
}
