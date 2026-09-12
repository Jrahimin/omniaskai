import Link from "next/link";

import { adminCopy } from "@/features/admin/admin-copy";
import { AdminTopicCreateForm } from "@/features/admin/admin-topic-create-form";
import { requireAdminPageSession } from "@/features/admin/require-admin-session";

export const dynamic = "force-dynamic";

export default async function AdminNewTopicPage() {
  await requireAdminPageSession();

  return (
    <main id="main" tabIndex={-1}>
      <Link href="/admin/topics" className="text-muted hover:text-foreground text-sm">
        {adminCopy.backToTopics}
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight">{adminCopy.newTopic}</h1>
      <AdminTopicCreateForm />
    </main>
  );
}
