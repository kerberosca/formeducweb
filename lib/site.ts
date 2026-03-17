export const siteConfig = {
  name: "ForméducWeb",
  description: "Diagnostic Loi 25, sites web, SEO et cybersécurité légère pour PME et OBNL du Québec.",
  locale: "fr-CA",
  territory: "Basé au Québec",
  email: "info@formeducweb.ca",
  phone: "",
  address: "101-5121 av. Chauveau Ouest, Québec (Québec) G2E 5A6, Canada",
  bookingUrl: process.env.NEXT_PUBLIC_BOOKING_URL || "/contact?source=appel-loi-25"
};

export const mainNavigation = [
  { href: "/services", label: "Services" },
  { href: "/loi-25", label: "Loi 25" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" }
];

export const legalNavigation = [
  { href: "/loi-25/cest-quoi", label: "C’est quoi la Loi 25 ?" },
  { href: "/politique-confidentialite", label: "Politique de confidentialité" },
  { href: "/politique-cookies", label: "Politique cookies" },
  { href: "/demande-confidentialite", label: "Demande confidentialité" },
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/conditions-utilisation", label: "Conditions d’utilisation" }
];
