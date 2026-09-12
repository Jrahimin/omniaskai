import type { Topic } from "./topic";
import { topicThemePresets } from "./topic-theme";

export type TopicPresentation = {
  artworkSrc?: string;
  objectPosition: string;
  mood: "tax" | "literature" | "history" | "culture";
  scrimFrom: string;
};

export function getTopicPresentation(topic: Topic): TopicPresentation {
  const preset = topicThemePresets[topic.themeKey];

  return {
    artworkSrc: topic.artworkSrc,
    objectPosition: topic.objectPosition,
    mood: preset.mood,
    scrimFrom: preset.scrimFrom,
  };
}

export function bundledArtworkSrc(storageKey: string): string {
  return storageKey.startsWith("/") ? storageKey : `/${storageKey}`;
}

export function uploadedArtworkSrc(assetId: string): string {
  return `/media/${assetId}`;
}

export function resolveArtworkSrc(input: {
  assetId: string | null;
  storageKind: "bundled" | "uploaded" | null;
  storageKey: string | null;
}): string | undefined {
  if (!input.storageKey || !input.storageKind) {
    return undefined;
  }

  if (input.storageKind === "bundled") {
    return bundledArtworkSrc(input.storageKey);
  }

  if (input.storageKind === "uploaded" && input.assetId) {
    return uploadedArtworkSrc(input.assetId);
  }

  return undefined;
}
