"use client";

import { ConversationWorkspaceIsland } from "@/features/conversations/conversation-workspace-island";
import { getConversationCopy } from "@/features/conversations/get-conversation-copy";
import { getTopicIdentity } from "@/features/conversations/get-topic-identity";
import { getTopicWorkspace } from "@/features/conversations/get-topic-workspace";
import { getLandingCopy } from "@/features/landing/get-landing-copy";
import { topicCardCopy } from "@/features/landing/topic-card-copy";
import { TopicKnowledgeCard } from "@/features/landing/topic-knowledge-card";
import { getTopicPresentation } from "@/features/topics/topic-presentation";
import { projectAdminPreviewTopic } from "@/features/topics/project-admin-preview-topic";
import type { TopicTranslationDraft } from "@/features/topics/topic-validation-schema";
import type { TopicThemeKey } from "@/features/topics/topic-theme";
import type { Locale } from "@/lib/locale/locale";

import { adminCopy } from "./admin-copy";

type AdminTopicPreviewProps = {
  topicId: string;
  slug: string;
  themeKey: TopicThemeKey;
  focalPosition: string;
  knowledgeReviewDate: string | null;
  artworkSrc?: string;
  locale: Locale;
  translations: {
    en: TopicTranslationDraft;
    bn?: TopicTranslationDraft;
  };
};

export function AdminTopicPreview({
  topicId,
  slug,
  themeKey,
  focalPosition,
  knowledgeReviewDate,
  artworkSrc,
  locale,
  translations,
}: AdminTopicPreviewProps) {
  const landing = getLandingCopy(locale);
  const conversation = getConversationCopy(locale);
  const topic = projectAdminPreviewTopic({
    id: topicId,
    slug,
    sortOrder: 1,
    themeKey,
    focalPosition,
    knowledgeReviewDate,
    artworkSrc,
    translations,
    locale,
  });
  const presentation = getTopicPresentation(topic);

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h3 className="text-lg font-semibold tracking-tight">{adminCopy.previewCard}</h3>
        <div className="mt-4 max-w-[42rem]">
          <TopicKnowledgeCard
            slug={topic.slug}
            copy={topicCardCopy(topic, landing)}
            presentation={presentation}
            interactive={false}
          />
        </div>
      </section>
      <section>
        <h3 className="text-lg font-semibold tracking-tight">{adminCopy.previewWorkspace}</h3>
        <div className="mt-4 overflow-hidden rounded-[1.4rem] border border-[var(--border)]">
          <ConversationWorkspaceIsland
            locale={locale}
            copy={conversation}
            identity={getTopicIdentity(topic, locale, conversation)}
            presentation={presentation}
            workspace={getTopicWorkspace(topic)}
            conversationEnabled={false}
          />
        </div>
      </section>
    </div>
  );
}
