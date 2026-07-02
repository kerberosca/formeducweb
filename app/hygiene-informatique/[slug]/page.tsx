import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SupportArticlePage } from "@/components/seo/support-article-page";
import { getAbsoluteUrl } from "@/lib/seo";
import { getSeoSupportPage, getSeoSupportPagesByTheme } from "@/lib/seo-content";

type HygieneArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getSeoSupportPagesByTheme("hygiene").map((page) => ({
    slug: page.slug
  }));
}

export async function generateMetadata({ params }: HygieneArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getSeoSupportPage("hygiene", slug);

  if (!page) {
    return {};
  }

  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: getAbsoluteUrl(page.path)
    },
    openGraph: {
      title: `${page.title} | ForméducWeb`,
      description: page.description,
      url: getAbsoluteUrl(page.path),
      type: "article"
    }
  };
}

export default async function HygieneArticlePage({ params }: HygieneArticlePageProps) {
  const { slug } = await params;
  const page = getSeoSupportPage("hygiene", slug);

  if (!page) {
    notFound();
  }

  return <SupportArticlePage page={page} />;
}

