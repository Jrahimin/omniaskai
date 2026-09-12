import type { Topic } from "@/features/topics/topic";
import type { Locale } from "@/lib/locale/locale";

import type {
  ConversationCopy,
  TopicIdentityCopy,
} from "./conversation-language";

export function getTopicIdentity(
  topic: Topic,
  locale: Locale,
  copy: ConversationCopy,
): TopicIdentityCopy {
  return {
    title: topic.title,
    subtitle: topic.workspaceSubtitle,
    badge: topic.badge,
    sourceDescription: topic.sourceDescription,
    knowledgeReviewDateLabel: topic.knowledgeReviewDate
      ? copy.reviewedOn.replace(
          "{date}",
          formatKnowledgeReviewDate(topic.knowledgeReviewDate, locale),
        )
      : undefined,
    composerPlaceholder: topic.composerPlaceholder,
    artworkAlt: topic.artworkAlt,
    aboutBody: topic.aboutDescription,
  };
}

function formatKnowledgeReviewDate(isoDate: string, locale: Locale): string {
  const date = new Date(`${isoDate}T00:00:00Z`);

  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }

  return new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
