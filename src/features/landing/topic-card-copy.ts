import type { Topic } from "@/features/topics/topic";

import type { LandingCopy, TopicCardCopy } from "./landing-language";

export function topicCardCopy(topic: Topic, copy: LandingCopy): TopicCardCopy {
  return {
    title: topic.title,
    subtitle: topic.landingDescription,
    sourceDescription: topic.sourceDescription,
    explore:
      topic.exploreLabel ??
      copy.topics.exploreTemplate.replace("{title}", topic.title),
    badge: topic.badge,
    exampleLabel: copy.topics.exampleLabel,
    preview: topic.preview
      ? {
          youLabel: topic.preview.youLabel || copy.topics.previewYouLabel,
          assistantLabel:
            topic.preview.assistantLabel || copy.topics.previewAssistantLabel,
          question: topic.preview.question,
          answer: topic.preview.answer,
          sources: topic.preview.sources,
        }
      : undefined,
  };
}
