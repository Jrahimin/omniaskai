import type { Locale } from "@/lib/locale/locale";

export type TopicPageCopy = {
  backToHome: string;
};

const topicPageLanguage: Record<Locale, TopicPageCopy> = {
  en: {
    backToHome: "Back to OmniAskAI",
  },
  bn: {
    backToHome: "OmniAskAI-তে ফিরে যান",
  },
};

export function getTopicPageCopy(locale: Locale): TopicPageCopy {
  return topicPageLanguage[locale];
}
