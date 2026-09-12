import Link from "next/link";

import { adminCopy } from "@/features/admin/admin-copy";
import { AdminTopicList } from "@/features/admin/admin-topic-list";
import { requireAdminPageSession } from "@/features/admin/require-admin-session";
import { listAdminTopics } from "@/features/topics/server/topic-admin-read";

export const dynamic = "force-dynamic";

export default async function AdminTopicsPage() {
  await requireAdminPageSession();
  const topics = await listAdminTopics();

  return (
    <main id="main" tabIndex={-1}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{adminCopy.topics}</h1>
          <p className="text-muted mt-1 text-sm">{adminCopy.topicsListHint}</p>
        </div>
        <Link
          href="/admin/topics/new"
          className="bg-brand shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold text-white"
        >
          {adminCopy.newTopic}
        </Link>
      </div>
      <AdminTopicList topics={topics} />
    </main>
  );
}
