import "server-only";

import { getTopicBySlug } from "./get-topic-by-slug";

const PROJECT_ENV_BY_TOPIC_ID: Record<string, string> = {
  topic_income_tax: "APE_PROJECT_INCOME_TAX",
  topic_literature: "APE_PROJECT_LITERATURE",
  topic_bangladesh_history: "APE_PROJECT_BANGLADESH_HISTORY",
  topic_movies_culture: "APE_PROJECT_MOVIES_CULTURE",
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function getApeProjectIdForTopicSlug(slug: string): string | undefined {
  const topic = getTopicBySlug(slug);

  if (!topic) {
    return undefined;
  }

  const envName = PROJECT_ENV_BY_TOPIC_ID[topic.id];

  if (!envName) {
    return undefined;
  }

  const projectId = process.env[envName]?.trim();

  if (!projectId || !UUID_PATTERN.test(projectId)) {
    return undefined;
  }

  return projectId;
}

export function getTopicIdForSlug(slug: string): string | undefined {
  return getTopicBySlug(slug)?.id;
}
