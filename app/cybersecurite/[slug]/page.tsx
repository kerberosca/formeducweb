import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SupportArticlePage } from "@/components/seo/support-article-page";
import { buildPageMetadata } from "@/lib/seo";
import {
  getSeoSupportPage,
  getSeoSupportPagesByTheme
} from "@/lib/seo-content";

type CybersecurityArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getSeoSupportPagesByTheme("cybersecurity").map((page) => ({
    slug: page.slug
  }));
}

export async function generateMetadata({
  params
}: CybersecurityArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getSeoSupportPage("cybersecurity", slug);

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

export default async function CybersecurityArticlePage({
  params
}: CybersecurityArticlePageProps) {
  const { slug } = await params;
  const page = getSeoSupportPage("cybersecurity", slug);

  if (!page) {
    notFound();
  }

  return <SupportArticlePage page={page} />;
}
