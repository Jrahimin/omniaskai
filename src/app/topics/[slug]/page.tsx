import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getTopicBySlug } from "@/features/topics/get-topic-by-slug";
import { getTopicPageCopy } from "@/features/topics/topic-page-language";
import { getRequestLocale } from "@/lib/locale/get-request-locale";

type TopicDestinationPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: TopicDestinationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);

  if (!topic) {
    return { title: "OmniAskAI" };
  }

  return {
    title: topic.title,
    description: topic.subtitle,
    robots: { index: false, follow: false },
  };
}

export default async function TopicDestinationPage({
  params,
}: TopicDestinationPageProps) {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);

  if (!topic) {
    notFound();
  }

  const locale = await getRequestLocale();
  const copy = getTopicPageCopy(locale);

  return (
    <main id="main" tabIndex={-1} className="landing-shell py-16">
      <p>
        <Link href="/" className="text-brand text-sm font-medium">
          {copy.backToHome}
        </Link>
      </p>
      <h1 className="text-foreground mt-8 text-3xl font-bold tracking-tight">
        {topic.title}
      </h1>
      <p className="text-muted mt-3 max-w-xl text-base leading-relaxed">
        {topic.subtitle}
      </p>
    </main>
  );
}
