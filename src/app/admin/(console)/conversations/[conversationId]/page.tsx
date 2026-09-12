import { notFound } from "next/navigation";

import { adminCopy } from "@/features/admin/admin-copy";
import { getAdminConversationDetail } from "@/features/admin/admin-conversation-read";
import { AdminConversationTranscript } from "@/features/admin/admin-conversation-transcript";
import { formatAdminTimestamp } from "@/features/admin/admin-timestamp";
import { requireAdminPageSession } from "@/features/admin/require-admin-session";

export const dynamic = "force-dynamic";

type AdminConversationDetailPageProps = {
  params: Promise<{ conversationId: string }>;
};

export default async function AdminConversationDetailPage({
  params,
}: AdminConversationDetailPageProps) {
  await requireAdminPageSession();
  const { conversationId } = await params;
  const detail = await getAdminConversationDetail(conversationId);

  if (!detail) {
    notFound();
  }

  const feedbackByMessage = Object.fromEntries(
    detail.operations
      .filter((operation) => operation.apeAssistantMessageId && operation.rating)
      .map((operation) => [operation.apeAssistantMessageId!, operation.rating!]),
  );

  return (
    <main id="main" tabIndex={-1} className="flex flex-col gap-6">
      <div>
        <p className="text-muted text-sm">{detail.topicSlug}</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">{detail.topicTitle}</h1>
        <p className="text-muted mt-2 text-sm">
          {detail.executionState} · {adminCopy.created}{" "}
          {formatAdminTimestamp(detail.createdAt)} · {adminCopy.lastActivity}{" "}
          {formatAdminTimestamp(detail.lastActivityAt)}
        </p>
      </div>

      {detail.transcript.status === "ok" ? (
        <AdminConversationTranscript
          conversationId={detail.id}
          initial={detail.transcript}
          feedbackByMessage={feedbackByMessage}
        />
      ) : (
        <p className="text-muted rounded-[1.2rem] border border-[var(--border)] bg-white/80 p-5 text-sm">
          {detail.transcript.status === "missing"
            ? adminCopy.transcriptMissing
            : adminCopy.transcriptUnavailable}
        </p>
      )}

      <section className="rounded-[1.2rem] border border-[var(--border)] bg-white/80 p-5">
        <h2 className="font-semibold">Turns</h2>
        <ul className="mt-3 flex flex-col gap-2 text-sm">
          {detail.operations.map((operation) => (
            <li key={operation.id} className="text-muted">
              #{operation.sequence} · {operation.state}
              {operation.resultClassification ? ` · ${operation.resultClassification}` : ""}
              {operation.rating
                ? ` · ${operation.rating === "up" ? adminCopy.feedbackUp : adminCopy.feedbackDown}`
                : ""}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
