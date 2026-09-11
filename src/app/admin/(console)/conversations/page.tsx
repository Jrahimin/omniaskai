import Link from "next/link";

import { adminCopy } from "@/features/admin/admin-copy";
import { listAdminConversations } from "@/features/admin/admin-conversation-read";
import { formatAdminTimestamp } from "@/features/admin/admin-timestamp";
import { requireAdminPageSession } from "@/features/admin/require-admin-session";
import { listAdminTopics } from "@/features/topics/server/topic-admin-read";

export const dynamic = "force-dynamic";

type AdminConversationsPageProps = {
  searchParams: Promise<{ topic?: string; page?: string }>;
};

function pageHref(page: number, topicId: string | undefined): string {
  const params = new URLSearchParams();
  params.set("page", String(page));
  if (topicId) {
    params.set("topic", topicId);
  }
  return `/admin/conversations?${params.toString()}`;
}

export default async function AdminConversationsPage({
  searchParams,
}: AdminConversationsPageProps) {
  const params = await searchParams;
  await requireAdminPageSession();
  const page = Math.max(Number(params.page ?? "1") || 1, 1);
  const limit = 20;
  const topicId = params.topic?.trim() || undefined;
  const [topics, conversations] = await Promise.all([
    listAdminTopics(),
    listAdminConversations({
      topicId,
      limit,
      offset: (page - 1) * limit,
    }),
  ]);
  const totalPages = Math.max(Math.ceil(conversations.total / limit), 1);

  return (
    <main id="main" tabIndex={-1}>
      <h1 className="text-2xl font-bold tracking-tight">{adminCopy.conversations}</h1>
      <form className="mt-5">
        <label className="text-sm">
          <span className="sr-only">{adminCopy.filterTopic}</span>
          <select
            name="topic"
            defaultValue={topicId ?? ""}
            className="rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm"
          >
            <option value="">{adminCopy.filterTopic}</option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.title}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="ml-2 cursor-pointer rounded-full border border-[var(--border)] px-3 py-2 text-sm"
        >
          Filter
        </button>
      </form>
      {conversations.items.length === 0 ? (
        <p className="text-muted mt-8 text-sm">{adminCopy.emptyConversations}</p>
      ) : (
        <ul className="mt-6 divide-y divide-[var(--border)] rounded-[1.2rem] border border-[var(--border)] bg-white/80">
          {conversations.items.map((conversation) => (
            <li key={conversation.id} className="px-4 py-3">
              <Link
                href={`/admin/conversations/${conversation.id}`}
                className="font-medium hover:underline"
              >
                {conversation.topicTitle}
              </Link>
              <p className="text-muted text-xs">
                {conversation.executionState} · {adminCopy.lastActivity}{" "}
                {formatAdminTimestamp(conversation.lastActivityAt)}
              </p>
            </li>
          ))}
        </ul>
      )}
      {totalPages > 1 ? (
        <nav className="mt-6 flex items-center gap-3 text-sm">
          {page > 1 ? (
            <Link
              href={pageHref(page - 1, topicId)}
              className="rounded-full border border-[var(--border)] px-3 py-1.5"
            >
              {adminCopy.previousPage}
            </Link>
          ) : null}
          {page < totalPages ? (
            <Link
              href={pageHref(page + 1, topicId)}
              className="rounded-full border border-[var(--border)] px-3 py-1.5"
            >
              {adminCopy.nextPage}
            </Link>
          ) : null}
        </nav>
      ) : null}
    </main>
  );
}
