import { notFound } from "next/navigation";

import { AdminTopicEditorForm } from "@/features/admin/admin-topic-editor-form";
import { loadAdminApeEditorProjectsAction } from "@/features/admin/admin-topic-actions";
import { requireAdminPageSession } from "@/features/admin/require-admin-session";
import { adminEditorSource } from "@/features/admin/admin-topic-editor-state";
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
  let apeProjects: Awaited<ReturnType<typeof loadAdminApeEditorProjectsAction>> = {
    items: [],
    total: 0,
    storedProject: null,
    listUnavailable: true,
  };

  try {
    topic = await getAdminTopicEditor(topicId);
    artworkOptions = await listAdminArtworkAssets();
    apeProjects = await loadAdminApeEditorProjectsAction(
      adminEditorSource(topic)?.apeProjectId ?? null,
    );
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
        initialProjects={apeProjects.items}
        projectsTotal={apeProjects.total}
        storedProject={apeProjects.storedProject}
        projectsUnavailable={apeProjects.listUnavailable}
        artworkOptions={artworkOptions}
      />
    </main>
  );
}
