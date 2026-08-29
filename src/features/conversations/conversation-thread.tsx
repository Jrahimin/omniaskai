import type { Locale } from "@/lib/locale/locale";
import type {
  AssistantTurn,
  ConversationSource,
  ConversationTurn,
} from "./conversation";
import { isAssistantTurn, isUserTurn } from "./conversation";
import { ConversationAssistantAnswer } from "./conversation-assistant-answer";
import type { ConversationCopy } from "./conversation-language";
import { CheckSmallIcon, SparkSmallIcon } from "./conversation-icons";

type ConversationThreadProps = {
  locale: Locale;
  copy: ConversationCopy;
  turns: ConversationTurn[];
  catalog: ConversationSource[];
  starters: string[];
  activeAnswerId: string | null;
  selectedSourceId: string | null;
  helpfulByAnswer: Record<string, "up" | "down" | null>;
  copiedAnswerId: string | null;
  onCitation: (answerId: string, sourceId: string) => void;
  onOpenSources: (answerId: string) => void;
  onCopy: (turn: AssistantTurn) => void;
  onHelpful: (answerId: string, value: "up" | "down") => void;
  onFollowUp: (text: string) => void;
};

export function ConversationThread({
  locale,
  copy,
  turns,
  catalog,
  starters,
  activeAnswerId,
  selectedSourceId,
  helpfulByAnswer,
  copiedAnswerId,
  onCitation,
  onOpenSources,
  onCopy,
  onHelpful,
  onFollowUp,
}: ConversationThreadProps) {
  if (turns.length === 0) {
    return (
      <div className="workspace-thread-inner mx-auto flex max-w-[46rem] flex-col justify-center px-1 py-8">
        <h2 className="text-[1.15rem] font-semibold tracking-tight">
          {copy.emptyTitle}
        </h2>
        <p className="text-muted mt-2 text-[0.9rem] leading-relaxed">
          {copy.emptyBody}
        </p>
        <p className="text-muted mt-5 text-[0.72rem] font-semibold tracking-wide uppercase">
          {copy.startersLabel}
        </p>
        <ul className="mt-2 flex flex-col gap-2">
          {starters.map((starter) => (
            <li key={starter}>
              <button
                type="button"
                onClick={() => onFollowUp(starter)}
                className="workspace-starter-chip w-full cursor-pointer px-3.5 py-2.5 text-left text-[0.88rem] leading-snug"
              >
                {starter}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const latestAssistantId = [...turns]
    .reverse()
    .find(
      (turn) =>
        isAssistantTurn(turn) &&
        turn.status !== "pending" &&
        turn.status !== "streaming",
    )?.id;

  return (
    <div className="workspace-thread-inner mx-auto flex w-full max-w-[46rem] flex-col gap-5">
      {turns.map((turn, index) => {
        if (isUserTurn(turn)) {
          return (
            <div key={turn.id} className="flex justify-end">
              <div className="max-w-[min(28rem,88%)]">
                <p className="text-muted mb-1 text-right text-[0.65rem]">
                  {copy.you} · {turn.createdAtLabel}
                </p>
                <div className="flex items-end justify-end gap-1.5">
                  <p className="workspace-user-bubble">{turn.text}</p>
                  <CheckSmallIcon className="text-[var(--workspace-accent)] mb-0.5 size-3.5 shrink-0" />
                </div>
              </div>
            </div>
          );
        }

        if (!isAssistantTurn(turn)) {
          return null;
        }

        const previous = turns[index - 1];
        const createdAtLabel =
          previous && isUserTurn(previous) ? previous.createdAtLabel : undefined;

        return (
          <div key={turn.id} className="flex flex-col gap-3">
            <ConversationAssistantAnswer
              locale={locale}
              copy={copy}
              turn={turn}
              catalog={catalog}
              createdAtLabel={createdAtLabel}
              selectedSourceId={
                activeAnswerId === turn.id ? selectedSourceId : null
              }
              isActiveEvidence={activeAnswerId === turn.id}
              helpful={helpfulByAnswer[turn.id] ?? null}
              copied={copiedAnswerId === turn.id}
              onCitation={(sourceId) => onCitation(turn.id, sourceId)}
              onOpenSources={() => onOpenSources(turn.id)}
              onCopy={() => onCopy(turn)}
              onHelpful={(value) => onHelpful(turn.id, value)}
            />
            {turn.id === latestAssistantId && turn.followUps.length > 0 ? (
              <FollowUps
                copy={copy}
                items={turn.followUps}
                onSelect={onFollowUp}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function FollowUps({
  copy,
  items,
  onSelect,
}: {
  copy: ConversationCopy;
  items: string[];
  onSelect: (text: string) => void;
}) {
  return (
    <div>
      <p className="text-muted mb-1.5 px-0.5 text-[0.68rem] font-semibold tracking-wide uppercase">
        {copy.exploreNext}
      </p>
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => (
          <li key={item} className="max-w-full">
            <button
              type="button"
              onClick={() => onSelect(item)}
              className="workspace-starter-chip inline-flex max-w-full cursor-pointer items-start gap-1.5 px-3 py-2 text-left text-[0.8rem] leading-snug"
            >
              <SparkSmallIcon className="text-brand mt-0.5 size-3.5 shrink-0" />
              <span>{item}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
