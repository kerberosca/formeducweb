export const siteConfig = {
  name: "ForméducWeb",
  description:
    "ForméducWeb rend le numérique utile, compréhensible et abordable grâce à la formation, aux sites Web, à l’automatisation et au soutien informatique.",
  locale: "fr-CA",
  territory: "Au service des organisations du Québec",
  email: "info@formeducweb.ca",
  phone: "",
  address: "101-5121 av. Chauveau Ouest, Québec (Québec) G2E 5A6, Canada",
  bookingUrl: "/contact?source=parler-besoin"
};

export const mainNavigation = [
  { href: "/", label: "Accueil" },
  { href: "/formations", label: "Formations" },
  { href: "/services", label: "Services" },
  { href: "/produits", label: "Boutique" },
  { href: "/ressources", label: "Ressources" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" }
] as const;

export const legalNavigation = [
  { href: "/loi-25/cest-quoi", label: "C'est quoi la Loi 25 ?" },
  { href: "/politique-confidentialite", label: "Politique de confidentialité" },
  { href: "/politique-cookies", label: "Politique cookies" },
  { href: "/demande-confidentialite", label: "Demande confidentialité" },
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/conditions-utilisation", label: "Conditions d'utilisation" }
];
