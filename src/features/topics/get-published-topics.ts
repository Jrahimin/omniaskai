import { cache } from "react";
import "server-only";

import type { Locale } from "@/lib/locale/locale";

import type { Topic } from "./topic";
import { loadPublishedTopicsFromDatabase } from "./server/topic-catalog-read";

export const getPublishedTopics = cache(
  async (locale: Locale): Promise<Topic[]> => {
    return loadPublishedTopicsFromDatabase(locale);
  },
);
