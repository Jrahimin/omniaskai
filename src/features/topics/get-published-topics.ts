import { sampleTopics } from "./sample-topics";
import type { Topic } from "./topic";

export function getPublishedTopics(): Topic[] {
  return sampleTopics
    .filter((topic) => topic.status === "published")
    .slice()
    .sort((left, right) => left.sortOrder - right.sortOrder);
}
