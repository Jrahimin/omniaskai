import type { Topic } from "./topic";

export type TopicPresentation = {
  artworkSrc: string;
  featured: boolean;
  objectPosition: string;
  mood: "tax" | "literature" | "history" | "culture";
  scrimFrom: string;
};

const topicPresentations: Record<string, TopicPresentation> = {
  "income-tax": {
    artworkSrc: "/topics/topic-income-tax.png",
    featured: true,
    objectPosition: "left center",
    mood: "tax",
    scrimFrom: "rgba(10, 38, 34, 0.58)",
  },
  literature: {
    artworkSrc: "/topics/topic-literature.png",
    featured: false,
    objectPosition: "left center",
    mood: "literature",
    scrimFrom: "rgba(28, 16, 54, 0.55)",
  },
  "bangladesh-history": {
    artworkSrc: "/topics/topic-bd-history.png",
    featured: false,
    objectPosition: "left center",
    mood: "history",
    scrimFrom: "rgba(46, 30, 14, 0.55)",
  },
  "movies-culture": {
    artworkSrc: "/topics/topic-movie-culture.png",
    featured: false,
    objectPosition: "left 40%",
    mood: "culture",
    scrimFrom: "rgba(52, 20, 16, 0.55)",
  },
};

export function getTopicPresentation(topic: Topic): TopicPresentation {
  const presentation = topicPresentations[topic.slug];

  if (!presentation) {
    throw new Error(`Missing landing presentation for topic "${topic.slug}".`);
  }

  return presentation;
}
