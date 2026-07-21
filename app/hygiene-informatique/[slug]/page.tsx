import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SupportArticlePage } from "@/components/seo/support-article-page";
import { buildPageMetadata } from "@/lib/seo";
import {
  getSeoSupportPage,
  getSeoSupportPagesByTheme
} from "@/lib/seo-content";

type HygieneArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getSeoSupportPagesByTheme("hygiene").map((page) => ({
    slug: page.slug
  }));
}

export async function generateMetadata({
  params
}: HygieneArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getSeoSupportPage("hygiene", slug);

  if (!page) {
    return {};
  }

  return buildPageMetadata({
    title: page.title,
    description: page.description,
    path: page.path,
    openGraphType: "article"
  });
}

export default async function HygieneArticlePage({
  params
}: HygieneArticlePageProps) {
  const { slug } = await params;
  const page = getSeoSupportPage("hygiene", slug);

  if (!page) {
    notFound();
  }

  return <SupportArticlePage page={page} />;
}
