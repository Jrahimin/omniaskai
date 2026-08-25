import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ConversationWorkspace } from "@/features/conversations/conversation-workspace";
import { getConversationCopy } from "@/features/conversations/get-conversation-copy";
import { isConversationTopicSlug } from "@/features/conversations/conversation-language";
import { getTopicWorkspace } from "@/features/conversations/get-topic-workspace";
import { getPublishedTopics } from "@/features/topics/get-published-topics";
import { getTopicBySlug } from "@/features/topics/get-topic-by-slug";
import { getTopicPresentation } from "@/features/topics/topic-presentation";
import { getRequestLocale } from "@/lib/locale/get-request-locale";

type TopicWorkspacePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getPublishedTopics().map((topic) => ({ slug: topic.slug }));
}

export async function generateMetadata({
  params,
}: TopicWorkspacePageProps): Promise<Metadata> {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);
  const locale = await getRequestLocale();
  const copy = getConversationCopy(locale);

  if (!topic || !isConversationTopicSlug(slug)) {
    return { title: "OmniAskAI" };
  }

  return {
    title: copy.topics[slug].title,
    description: copy.topics[slug].subtitle,
    robots: { index: false, follow: false },
  };
}

export default async function TopicWorkspacePage({
  params,
}: TopicWorkspacePageProps) {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);
  const workspace = getTopicWorkspace(slug);

  if (!topic || !workspace || !isConversationTopicSlug(slug)) {
    notFound();
  }

  const locale = await getRequestLocale();
  const copy = getConversationCopy(locale);
  const presentation = getTopicPresentation(topic);
  const identity = copy.topics[slug];

  return (
    <ConversationWorkspace
      locale={locale}
      copy={copy}
      identity={identity}
      presentation={presentation}
      workspace={workspace}
    />
  );
}
