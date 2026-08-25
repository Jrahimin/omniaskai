import type { TopicWorkspace } from "../conversation";

import { bangladeshHistoryWorkspace } from "./bangladesh-history";
import { incomeTaxWorkspace } from "./income-tax";
import { literatureWorkspace } from "./literature";
import { moviesCultureWorkspace } from "./movies-culture";

const workspaces: Record<string, TopicWorkspace> = {
  "income-tax": incomeTaxWorkspace,
  literature: literatureWorkspace,
  "bangladesh-history": bangladeshHistoryWorkspace,
  "movies-culture": moviesCultureWorkspace,
};

export function getTopicWorkspace(slug: string): TopicWorkspace | undefined {
  return workspaces[slug];
}
