import type { Locale } from "@/lib/locale/locale";
import type { Topic } from "@/features/topics/topic";

import type { LandingCopy, TopicCardCopy } from "./landing-language";

export function topicCardCopy(
  topic: Topic,
  copy: LandingCopy,
  locale: Locale,
): TopicCardCopy {
  const preview = topic.preview;
  const exampleInEnglish =
    locale === "bn" &&
    preview != null &&
    !/[\u0980-\u09FF]/.test(preview.question);

  return {
    title: topic.title,
    subtitle: topic.landingDescription,
    sourceDescription: topic.sourceDescription,
    explore:
      topic.exploreLabel ??
      copy.topics.exploreTemplate.replace("{title}", topic.title),
    badge: topic.badge,
    exampleLabel: exampleInEnglish
      ? copy.topics.englishExample
      : copy.topics.exampleLabel,
    exampleNote: exampleInEnglish ? copy.topics.englishExample : undefined,
    preview: preview
      ? {
          youLabel: preview.youLabel || copy.topics.previewYouLabel,
          assistantLabel:
            preview.assistantLabel || copy.topics.previewAssistantLabel,
          question: preview.question,
          answer: preview.answer,
          sources: preview.sources,
        }
      : undefined,
  };
}
