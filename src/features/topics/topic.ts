export type TopicStatus = "published" | "draft";

export type Topic = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  status: TopicStatus;
  sortOrder: number;
};
