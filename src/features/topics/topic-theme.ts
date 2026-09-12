export const topicThemeKeys = [
  "tax",
  "literature",
  "history",
  "culture",
] as const;

export type TopicThemeKey = (typeof topicThemeKeys)[number];

export type TopicThemePreset = {
  mood: TopicThemeKey;
  scrimFrom: string;
};

export const topicThemePresets: Record<TopicThemeKey, TopicThemePreset> = {
  tax: {
    mood: "tax",
    scrimFrom: "rgba(10, 38, 34, 0.58)",
  },
  literature: {
    mood: "literature",
    scrimFrom: "rgba(28, 16, 54, 0.55)",
  },
  history: {
    mood: "history",
    scrimFrom: "rgba(46, 30, 14, 0.55)",
  },
  culture: {
    mood: "culture",
    scrimFrom: "rgba(52, 20, 16, 0.55)",
  },
};

export function isTopicThemeKey(value: string): value is TopicThemeKey {
  return (topicThemeKeys as readonly string[]).includes(value);
}
