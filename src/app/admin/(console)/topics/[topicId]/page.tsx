import { notFound } from "next/navigation";

import { AdminTopicEditorForm } from "@/features/admin/admin-topic-editor-form";
import { listAdminApeProjectsAction } from "@/features/admin/admin-topic-actions";
import { requireAdminPageSession } from "@/features/admin/require-admin-session";
import {
  getAdminTopicEditor,
  listAdminArtworkAssets,
} from "@/features/topics/server/topic-admin-read";
import { TopicNotFoundError } from "@/features/topics/server/topic-errors";

export const dynamic = "force-dynamic";

type AdminTopicEditPageProps = {
  params: Promise<{ topicId: string }>;
};

export default async function AdminTopicEditPage({ params }: AdminTopicEditPageProps) {
  await requireAdminPageSession();
  const { topicId } = await params;
  let topic;
  let artworkOptions: Awaited<ReturnType<typeof listAdminArtworkAssets>> = [];
  let projects: Awaited<ReturnType<typeof listAdminApeProjectsAction>> = {
    ok: false,
    code: "unreachable",
    message: "",
  };

  try {
    topic = await getAdminTopicEditor(topicId);
    artworkOptions = await listAdminArtworkAssets();
    projects = await listAdminApeProjectsAction({ limit: 20, offset: 0 });
  } catch (error) {
    if (error instanceof TopicNotFoundError) {
      notFound();
    }

    throw error;
  }

  return (
    <main id="main" tabIndex={-1}>
      <AdminTopicEditorForm
        topic={topic}
        initialProjects={projects.ok ? projects.items : []}
        artworkOptions={artworkOptions}
      />
    </main>
  );
}
