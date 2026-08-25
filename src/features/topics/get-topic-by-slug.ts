import { sampleTopics } from "./sample-topics";
import type { Topic } from "./topic";

export function getTopicBySlug(slug: string): Topic | undefined {
  return sampleTopics.find((topic) => topic.slug === slug);
}
