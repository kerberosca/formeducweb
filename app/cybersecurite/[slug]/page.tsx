import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SupportArticlePage } from "@/components/seo/support-article-page";
import { getAbsoluteUrl } from "@/lib/seo";
import { getSeoSupportPage, getSeoSupportPagesByTheme } from "@/lib/seo-content";

type CybersecurityArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getSeoSupportPagesByTheme("cybersecurity").map((page) => ({
    slug: page.slug
  }));
}

export async function generateMetadata({ params }: CybersecurityArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getSeoSupportPage("cybersecurity", slug);

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

export default async function CybersecurityArticlePage({ params }: CybersecurityArticlePageProps) {
  const { slug } = await params;
  const page = getSeoSupportPage("cybersecurity", slug);

  if (!page) {
    notFound();
  }

  return <SupportArticlePage page={page} />;
}

