"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import type { AdminTopicSummary } from "@/features/topics/admin-topic-types";

import { adminCopy } from "./admin-copy";
import { reorderAdminTopicsAction } from "./admin-topic-actions";

type AdminTopicListProps = {
  topics: AdminTopicSummary[];
};

export function AdminTopicList({ topics }: AdminTopicListProps) {
  const router = useRouter();

  async function move(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;

    if (nextIndex < 0 || nextIndex >= topics.length) {
      return;
    }

    const ordered = [...topics];
    const current = ordered[index];
    const swap = ordered[nextIndex];

    if (!current || !swap) {
      return;
    }

    ordered[index] = swap;
    ordered[nextIndex] = current;

    await reorderAdminTopicsAction({
      orderedIds: ordered.map((topic) => topic.id),
      expectedVersions: Object.fromEntries(topics.map((topic) => [topic.id, topic.version])),
    });
    router.refresh();
  }

  if (topics.length === 0) {
    return <p className="text-muted mt-8 text-sm">{adminCopy.emptyTopics}</p>;
  }

  return (
    <ul className="mt-6 divide-y divide-[var(--border)] rounded-[1.2rem] border border-[var(--border)] bg-white/80">
      {topics.map((topic, index) => (
        <li key={topic.id} className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <Link href={`/admin/topics/${topic.id}`} className="font-medium hover:underline">
              {topic.title}
            </Link>
            <p className="text-muted text-xs">
              {topic.slug} · {topicStatus(topic)}
            </p>
          </div>
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              disabled={index === 0}
              className="text-muted cursor-pointer rounded-full px-2 py-1 text-xs disabled:cursor-default disabled:opacity-30"
              onClick={() => void move(index, -1)}
            >
              {adminCopy.moveUp}
            </button>
            <button
              type="button"
              disabled={index === topics.length - 1}
              className="text-muted cursor-pointer rounded-full px-2 py-1 text-xs disabled:cursor-default disabled:opacity-30"
              onClick={() => void move(index, 1)}
            >
              {adminCopy.moveDown}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

function topicStatus(topic: AdminTopicSummary): string {
  if (topic.isLive && topic.hasDraft) {
    return `${adminCopy.statusLive} · ${adminCopy.statusDraftWaiting}`;
  }

  if (topic.isLive) {
    return adminCopy.statusLive;
  }

  if (topic.hasDraft) {
    return adminCopy.statusDraft;
  }

  return adminCopy.statusUnpublished;
}
