import type { TopicPresentation } from "@/features/topics/topic-presentation";
import type { Locale } from "@/lib/locale/locale";

import type { TopicWorkspace } from "./conversation";
import type {
  ConversationCopy,
  TopicIdentityCopy,
} from "./conversation-language";
import { ConversationWorkspaceIsland } from "./conversation-workspace-island";

type ConversationWorkspaceProps = {
  locale: Locale;
  copy: ConversationCopy;
  identity: TopicIdentityCopy;
  presentation: TopicPresentation;
  workspace: TopicWorkspace;
};

export function ConversationWorkspace({
  locale,
  copy,
  identity,
  presentation,
  workspace,
}: ConversationWorkspaceProps) {
  return (
    <ConversationWorkspaceIsland
      locale={locale}
      copy={copy}
      identity={identity}
      presentation={presentation}
      workspace={workspace}
    />
  );
}
