import type { Locale } from "@/lib/locale/locale";
import type {
  AssistantTurn,
  ConversationSource,
  ConversationTurn,
} from "./conversation";
import { isAssistantTurn, isUserTurn } from "./conversation";
import { ConversationAssistantAnswer } from "./conversation-assistant-answer";
import type { ConversationCopy } from "./conversation-language";
import type { TopicOpening } from "./topic-opening";
import { CheckSmallIcon, SparkSmallIcon } from "./conversation-icons";

type ConversationThreadProps = {
  locale: Locale;
  copy: ConversationCopy;
  turns: ConversationTurn[];
  catalog: ConversationSource[];
  activeAnswerId: string | null;
  selectedSourceId: string | null;
  helpfulByAnswer: Record<string, "up" | "down" | null>;
  helpfulPendingId: string | null;
  helpfulErrorByAnswer: Record<string, true>;
  copiedAnswerId: string | null;
  onCitation: (answerId: string, sourceId: string) => void;
  onOpenSources: (answerId: string) => void;
  onCopy: (turn: AssistantTurn) => void;
  onHelpful: (answerId: string, value: "up" | "down") => void;
  onFollowUp: (text: string) => void;
  opening: TopicOpening;
};

export function ConversationThread({
  locale,
  copy,
  turns,
  catalog,
  activeAnswerId,
  selectedSourceId,
  helpfulByAnswer,
  helpfulPendingId,
  helpfulErrorByAnswer,
  copiedAnswerId,
  onCitation,
  onOpenSources,
  onCopy,
  onHelpful,
  onFollowUp,
  opening,
}: ConversationThreadProps) {
  if (turns.length === 0) {
    return (
      <div className="workspace-opening workspace-thread-inner mx-auto flex w-full max-w-[50rem] flex-col pb-5">
        <div className="workspace-opening-section-head">
          <h3>{opening.starterLabel}</h3>
          <p>{opening.starterHint}</p>
        </div>
        <ul className="workspace-opening-prompts">
          {opening.cards.map((card, index) => (
            <li key={card.question}>
              <button
                type="button"
                onClick={() => onFollowUp(card.question)}
                className="workspace-opening-prompt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                <span className="workspace-opening-prompt-top"><span className="workspace-opening-prompt-index">0{index + 1}</span><span aria-hidden="true" className="workspace-opening-prompt-arrow">↗</span></span>
                <span className="workspace-opening-prompt-title">{card.title}</span>
                {card.title !== card.question ? (
                  <span className="workspace-opening-prompt-question">{card.question}</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
        <details className="workspace-opening-coverage">
          <summary><span>{opening.coverageTitle}</span><span aria-hidden="true">↗</span></summary>
          <div className="text-muted mt-2 space-y-2 text-[0.84rem] leading-relaxed">
            <p>{opening.coverageBody}</p>
            {opening.coverageReview ? <p>{opening.coverageReview}</p> : null}
            <p>{opening.coverageNote}</p>
          </div>
        </details>
        {opening.coverageYear ? <p className="workspace-opening-year">{opening.coverageYear}</p> : null}
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
            <div key={turn.id} className="workspace-message-arrive flex justify-end">
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
              helpfulPending={helpfulPendingId === turn.id}
              helpfulError={helpfulErrorByAnswer[turn.id] === true}
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
