import { PRODUCT_CATALOG } from "@/lib/commerce";
import { diagnosticList } from "@/lib/diagnostics";
import { practicalResources } from "@/lib/resources";
import { seoSupportPages, seoThemeLabels } from "@/lib/seo-content";
import { services } from "@/lib/services";
import { trainingCourses } from "@/lib/training";

export const searchCategories = [
  "Formation",
  "Service",
  "Produit",
  "Guide",
  "Ressource",
  "Réalisation",
  "FAQ"
] as const;

export type SearchCategory = (typeof searchCategories)[number];

export type SearchDocument = {
  category: SearchCategory;
  title: string;
  description: string;
  href: string;
  keywords: readonly string[];
};

export type SearchResult = SearchDocument & {
  score: number;
};

type SearchableCourse = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  theme: string;
  level: string;
  offer: string;
  format: string;
  audience: string;
  outcomes: readonly string[];
};

export function courseSearchDocuments(
  courses: readonly SearchableCourse[]
): SearchDocument[] {
  return courses.map((course) => ({
    category: "Formation",
    title: course.title,
    description: course.description,
    href: `/formations/${course.slug}`,
    keywords: [
      course.shortTitle,
      course.theme,
      course.level,
      course.offer,
      course.format,
      course.audience,
      ...course.outcomes
    ]
  }));
}

const productRoutes = [
  { code: "loi25_kit", href: "/loi-25" },
  { code: "cyber_kit", href: "/cybersecurite" },
  { code: "ai_kit", href: "/intelligence-artificielle" },
  { code: "digital_hygiene_trio", href: "/trio-hygiene-numerique" }
] as const;

function uniqueDocuments(documents: readonly SearchDocument[]) {
  const seen = new Set<string>();

  return documents.filter((document) => {
    const key = `${document.category}:${document.href}:${document.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export const siteSearchDocuments: readonly SearchDocument[] = uniqueDocuments([
  ...courseSearchDocuments(trainingCourses),
  ...services.map((service) => ({
    category: "Service" as const,
    title: service.shortTitle,
    description: service.summary,
    href: service.href,
    keywords: [
      service.eyebrow,
      service.title,
      ...service.outcomes,
      ...service.scope,
      ...service.fit
    ]
  })),
  ...productRoutes.map(({ code, href }) => {
    const product = PRODUCT_CATALOG[code];

    return {
      category: "Produit" as const,
      title: product.name,
      description: product.description,
      href,
      keywords: [
        "boutique",
        "diagnostic",
        "kit 90 jours",
        `${product.amountCents / 100} $`,
        "autonome"
      ]
    };
  }),
  ...seoSupportPages.map((page) => ({
    category: "Guide" as const,
    title: page.shortTitle,
    description: page.description,
    href: page.path,
    keywords: [
      page.title,
      page.primaryKeyword,
      seoThemeLabels[page.theme],
      ...page.takeaways
    ]
  })),
  ...practicalResources.map((resource) => ({
    category: "Ressource" as const,
    title: resource.title,
    description: resource.description,
    href: resource.href,
    keywords: [resource.topic, resource.formatLabel, ...resource.keywords]
  })),
  {
    category: "Réalisation" as const,
    title: "Escadron 839 Lions de Chibougamau",
    description:
      "Étude de cas d’un site public avec communications, activités, annonces, calendrier annuel et version imprimable.",
    href: "/realisations/escadron-839",
    keywords: [
      "réalisation",
      "démonstration",
      "site Web",
      "calendrier",
      "outil numérique"
    ]
  },
  ...diagnosticList.flatMap((diagnostic) =>
    diagnostic.content.faq.map((item) => ({
      category: "FAQ" as const,
      title: item.question,
      description: item.answer,
      href: diagnostic.path,
      keywords: [diagnostic.label, diagnostic.themeLabel, "question fréquente"]
    }))
  ),
  ...seoSupportPages.flatMap((page) =>
    page.faq.map((item) => ({
      category: "FAQ" as const,
      title: item.question,
      description: item.answer,
      href: page.path,
      keywords: [
        page.shortTitle,
        page.primaryKeyword,
        seoThemeLabels[page.theme],
        "question fréquente"
      ]
    }))
  )
]);

export function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, " ")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLocaleLowerCase("fr-CA");
}

function scoreDocument(document: SearchDocument, normalizedQuery: string) {
  const title = normalizeSearchText(document.title);
  const description = normalizeSearchText(document.description);
  const keywords = document.keywords.map(normalizeSearchText);
  const keywordText = keywords.join(" ");
  const tokens = normalizedQuery.split(" ").filter(Boolean);
  const searchableText = `${title} ${keywordText} ${description}`;

  if (!tokens.every((token) => searchableText.includes(token))) return 0;

  let score = 1;

  if (title === normalizedQuery) score += 1000;
  else if (title.startsWith(normalizedQuery)) score += 750;
  else if (title.includes(normalizedQuery)) score += 650;

  if (keywords.some((keyword) => keyword === normalizedQuery)) score += 550;
  else if (keywordText.includes(normalizedQuery)) score += 420;

  if (description.includes(normalizedQuery)) score += 260;

  for (const token of tokens) {
    if (title.includes(token)) score += 70;
    if (keywordText.includes(token)) score += 35;
    if (description.includes(token)) score += 12;
  }

  return score;
}

export function searchSite(
  query: string,
  documents: readonly SearchDocument[] = siteSearchDocuments
): SearchResult[] {
  const normalizedQuery = normalizeSearchText(query.slice(0, 160));
  if (!normalizedQuery) return [];

  return documents
    .map((document) => ({
      ...document,
      score: scoreDocument(document, normalizedQuery)
    }))
    .filter((document) => document.score > 0)
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.title.localeCompare(right.title, "fr-CA", { sensitivity: "base" })
    );
}
