import type { Topic } from "@/features/topics/topic";

import type { TopicWorkspace } from "./conversation";

export function getTopicWorkspace(topic: Topic): TopicWorkspace {
  return {
    topicSlug: topic.slug,
    starterQuestions: topic.starterQuestions,
  };
}
