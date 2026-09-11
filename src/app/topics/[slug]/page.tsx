import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ConversationWorkspace } from "@/features/conversations/conversation-workspace";
import { getConversationCopy } from "@/features/conversations/get-conversation-copy";
import { getTopicIdentity } from "@/features/conversations/get-topic-identity";
import { getTopicWorkspace } from "@/features/conversations/get-topic-workspace";
import { getTopicBySlug } from "@/features/topics/get-topic-by-slug";
import { getTopicPresentation } from "@/features/topics/topic-presentation";
import { isTopicCatalogUnavailableError } from "@/features/topics/server/topic-errors";
import { getRequestLocale } from "@/lib/locale/get-request-locale";

type TopicWorkspacePageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: TopicWorkspacePageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getRequestLocale();
  const copy = getConversationCopy(locale);

  try {
    const topic = await getTopicBySlug(slug, locale);

    if (!topic) {
      return { title: "OmniAskAI" };
    }

    return {
      title: topic.title,
      description: topic.workspaceSubtitle,
      robots: { index: false, follow: false },
    };
  } catch {
    return {
      title: copy.catalogUnavailableTitle,
      robots: { index: false, follow: false },
    };
  }
}

export default async function TopicWorkspacePage({
  params,
}: TopicWorkspacePageProps) {
  const { slug } = await params;
  const locale = await getRequestLocale();
  const copy = getConversationCopy(locale);

  let topic;
  let unavailable = false;

  try {
    topic = await getTopicBySlug(slug, locale);
  } catch (error) {
    if (!isTopicCatalogUnavailableError(error)) {
      throw error;
    }

    unavailable = true;
  }

  if (unavailable) {
    return (
      <main id="main" tabIndex={-1} className="landing-shell py-20">
        <h1 className="text-3xl font-bold tracking-tight">
          {copy.catalogUnavailableTitle}
        </h1>
        <p className="text-muted mt-3 max-w-md text-base leading-relaxed">
          {copy.catalogUnavailableBody}
        </p>
      </main>
    );
  }

  if (!topic) {
    notFound();
  }

  const presentation = getTopicPresentation(topic);
  const workspace = getTopicWorkspace(topic);
  const identity = getTopicIdentity(topic, locale, copy);

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
