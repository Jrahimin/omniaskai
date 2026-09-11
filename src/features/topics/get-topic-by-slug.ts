import { cache } from "react";
import "server-only";

import type { Locale } from "@/lib/locale/locale";

import type { Topic } from "./topic";
import { loadPublishedTopicBySlugFromDatabase } from "./server/topic-catalog-read";

export const getTopicBySlug = cache(
  async (slug: string, locale: Locale): Promise<Topic | undefined> => {
    return loadPublishedTopicBySlugFromDatabase(slug, locale);
  },
);
