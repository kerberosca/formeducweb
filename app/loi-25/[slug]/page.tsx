import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SupportArticlePage } from "@/components/seo/support-article-page";
import { buildPageMetadata } from "@/lib/seo";
import {
  getSeoSupportPage,
  getSeoSupportPagesByTheme
} from "@/lib/seo-content";

type Loi25ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getSeoSupportPagesByTheme("loi25").map((page) => ({
    slug: page.slug
  }));
}

export async function generateMetadata({
  params
}: Loi25ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getSeoSupportPage("loi25", slug);

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

export default async function Loi25ArticlePage({
  params
}: Loi25ArticlePageProps) {
  const { slug } = await params;
  const page = getSeoSupportPage("loi25", slug);

  if (!page) {
    notFound();
  }

  return <SupportArticlePage page={page} />;
}
