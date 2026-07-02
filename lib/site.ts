export const siteConfig = {
  name: "ForméducWeb",
  description: "Diagnostics Loi 25, cybersécurité et IA pour améliorer l'hygiène informatique des PME et OBNL du Québec.",
  locale: "fr-CA",
  territory: "Base au Québec",
  email: "info@formeducweb.ca",
  phone: "",
  address: "101-5121 av. Chauveau Ouest, Québec (Québec) G2E 5A6, Canada",
  bookingUrl: process.env.NEXT_PUBLIC_BOOKING_URL || "/contact?source=appel-diagnostic"
};

export const mainNavigation = [
  { href: "/hygiene-informatique", label: "Hygiène" },
  { href: "/loi-25", label: "Loi 25" },
  { href: "/cybersecurite", label: "Cybersécurité" },
  { href: "/intelligence-artificielle", label: "IA" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" }
];

export const legalNavigation = [
  { href: "/loi-25/cest-quoi", label: "C'est quoi la Loi 25 ?" },
  { href: "/politique-confidentialite", label: "Politique de confidentialité" },
  { href: "/politique-cookies", label: "Politique cookies" },
  { href: "/demande-confidentialite", label: "Demande confidentialité" },
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/conditions-utilisation", label: "Conditions d'utilisation" }
];
