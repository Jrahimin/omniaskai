import type { TopicWorkspace } from "../conversation";

export const topicWorkspaces: Record<string, TopicWorkspace> = {
  "income-tax": {
    topicSlug: "income-tax",
    exploreItemIds: ["guides", "calculators", "updates", "scenarios"],
    starterQuestions: [
      "What income sources are taxable in Bangladesh?",
      "How is capital gain tax calculated?",
      "Salary-r upor tax kivabe count hoy?",
    ],
  },
  literature: {
    topicSlug: "literature",
    exploreItemIds: ["guides", "calculators", "updates", "scenarios"],
    starterQuestions: [
      "রবীন্দ্রনাথের 'দুই বিঘা জমি' কবিতার আসল কথাটা কী?",
      "What is the mood of Gitanjali?",
      "জীবনানন্দের কবিতায় নিসর্গ কেন এত গুরুত্বপূর্ণ?",
    ],
  },
  "bangladesh-history": {
    topicSlug: "bangladesh-history",
    exploreItemIds: ["guides", "calculators", "updates", "scenarios"],
    starterQuestions: [
      "British raj kivabe Bangla dokhol korlo?",
      "1971-er mujibnagar sorkar kothay gothito hoy?",
      "What was the Language Movement asking for?",
    ],
  },
  "movies-culture": {
    topicSlug: "movies-culture",
    exploreItemIds: ["guides", "calculators", "updates", "scenarios"],
    starterQuestions: [
      "সত্যজিৎ রায়ের সিনেমা এত আলাদা কেন?",
      "Where can I watch Jukti Takko Aar Gappo?",
      "What is the song 'Ami Banglay Gaan Gai' about?",
    ],
  },
};

export function getTopicWorkspace(slug: string): TopicWorkspace | undefined {
  return topicWorkspaces[slug];
}
