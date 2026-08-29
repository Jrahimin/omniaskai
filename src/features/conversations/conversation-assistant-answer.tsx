import Image from "next/image";

import type { Locale } from "@/lib/locale/locale";

import { stripCitationMarkers } from "./citation-markers";
import { AnswerRichText } from "./conversation-answer-text";
import type {
  AssistantTurn,
  ConversationSource,
} from "./conversation";
import { sourceById, sourcesForIds, citationDisplayById } from "./conversation";
import {
  formatEvidenceCounts,
  formatLocalizedCount,
} from "./conversation-guide";
import type { ConversationCopy } from "./conversation-language";
import {
  CheckSmallIcon,
  CopyIcon,
  LightbulbIcon,
  ShieldIcon,
  SourcesMarkIcon,
  ThumbDownIcon,
  ThumbUpIcon,
} from "./conversation-icons";
import { groupSourcesByDocument } from "./group-conversation-sources";

type ConversationAssistantAnswerProps = {
  locale: Locale;
  copy: ConversationCopy;
  turn: AssistantTurn;
  catalog: ConversationSource[];
  createdAtLabel?: string;
  selectedSourceId: string | null;
  isActiveEvidence: boolean;
  helpful: "up" | "down" | null;
  copied: boolean;
  onCitation: (sourceId: string) => void;
  onOpenSources: () => void;
  onCopy: () => void;
  onHelpful: (value: "up" | "down") => void;
};

export function ConversationAssistantAnswer({
  locale,
  copy,
  turn,
  catalog,
  createdAtLabel,
  selectedSourceId,
  isActiveEvidence,
  helpful,
  copied,
  onCitation,
  onOpenSources,
  onCopy,
  onHelpful,
}: ConversationAssistantAnswerProps) {
  if (turn.status === "pending") {
    return (
      <PendingAnswer copy={copy} createdAtLabel={createdAtLabel} />
    );
  }

  if (turn.status === "streaming") {
    const text =
      turn.blocks[0]?.type === "paragraph"
        ? stripCitationMarkers(turn.blocks[0].text)
        : "";

    if (!text) {
      return (
        <PendingAnswer copy={copy} createdAtLabel={createdAtLabel} />
      );
    }

    return (
      <article className="workspace-answer-card workspace-answer-arrive">
        <div className="flex items-start justify-between gap-3">
          <AnswerIdentity createdAtLabel={createdAtLabel} />
          <span
            className="invisible inline-flex shrink-0 items-center gap-1 px-1.5 py-0.5 text-[0.7rem]"
            aria-hidden="true"
          >
            <CopyIcon className="size-3.5" />
            {copy.copyAnswer}
          </span>
        </div>
        <div className="workspace-answer-body mt-4">
          <AnswerRichText text={text} />
        </div>
      </article>
    );
  }

  if (turn.status === "error") {
    return (
      <article className="workspace-answer-card workspace-answer-error">
        <AnswerIdentity createdAtLabel={createdAtLabel} />
        <h2 className="mt-4 text-[1.02rem] font-semibold">{copy.errorTitle}</h2>
        <p className="text-muted mt-1.5 text-[0.9rem] leading-relaxed">
          {turn.retryable ? copy.retryableErrorBody : copy.errorBody}
        </p>
      </article>
    );
  }

  const cited = sourcesForIds(catalog, turn.sourceIds);
  const displayById = citationDisplayById(turn.sourceIds);
  const showCue = cited.length > 0;
  const sourceCount = groupSourcesByDocument(cited).length;
  const evidenceLabel = showCue
    ? formatEvidenceCounts(
        sourceCount,
        cited.length,
        copy.basedOnEvidence,
        copy.sourcesCount,
        copy.referencesCount,
        locale,
      )
    : undefined;
  const sourcesLabel =
    cited.length > 0
      ? formatEvidenceCounts(
          sourceCount,
          cited.length,
          copy.evidenceCounts,
          copy.sourcesCount,
          copy.referencesCount,
          locale,
        )
      : copy.sources;
  const firstBlock = turn.blocks[0];
  const leadParagraph =
    turn.status === "grounded" && firstBlock?.type === "paragraph"
      ? firstBlock
      : null;

  return (
    <article
      className={`workspace-answer-card workspace-answer-settle ${
        isActiveEvidence ? "workspace-answer-active" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <AnswerIdentity
          createdAtLabel={createdAtLabel}
          evidenceLabel={evidenceLabel}
        />
        <button
          type="button"
          onClick={onCopy}
          className="text-muted hover:text-foreground inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full px-1.5 py-0.5 text-[0.7rem]"
        >
          <CopyIcon className="size-3.5" />
          {copied ? copy.copied : copy.copyAnswer}
        </button>
      </div>

      <div className="workspace-answer-body mt-4">
        {turn.blocks.map((block, index) => {
          if (block.type === "paragraph") {
            const isLead = leadParagraph === block;

            return (
              <AnswerRichText
                key={index}
                text={block.text}
                leadLabel={
                  isLead ? (
                    <>
                      <CheckSmallIcon className="size-3.5" />
                      {copy.quickAnswer}
                    </>
                  ) : undefined
                }
                after={
                  <CitationRow
                    locale={locale}
                    ids={block.citationIds}
                    catalog={catalog}
                    displayById={displayById}
                    selectedSourceId={selectedSourceId}
                    onCitation={onCitation}
                  />
                }
              />
            );
          }

          if (block.type === "heading") {
            return (
              <h2 key={index} className="workspace-answer-heading">
                {block.text}
              </h2>
            );
          }

          if (block.type === "list") {
            return (
              <ul key={index} className="flex flex-col gap-2.5">
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex gap-2.5">
                    <span className="workspace-answer-bullet" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[0.95rem] font-semibold tracking-tight">
                        {item.title}{" "}
                        <CitationRow
                          locale={locale}
                          ids={item.citationIds}
                          catalog={catalog}
                          displayById={displayById}
                          selectedSourceId={selectedSourceId}
                          onCitation={onCitation}
                        />
                      </p>
                      <p className="text-muted mt-0.5 text-[0.86rem] leading-relaxed">
                        {item.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            );
          }

          if (block.type === "callout") {
            return (
              <aside key={index} className="workspace-answer-note">
                <LightbulbIcon className="mt-0.5 size-4 shrink-0 text-[#b77828]" />
                <p className="text-[0.86rem] leading-relaxed text-[#3a3328]">
                  {block.text}
                </p>
              </aside>
            );
          }

          if (block.type === "formula") {
            return (
              <p key={index} className="workspace-answer-formula">
                {block.text}
              </p>
            );
          }

          return (
            <aside key={index} className="workspace-answer-note">
              <p className="text-[0.92rem] font-semibold">{block.title}</p>
              {block.body ? (
                <p className="text-muted mt-1.5 text-[0.86rem] leading-relaxed">
                  {block.body}
                </p>
              ) : null}
            </aside>
          );
        })}
      </div>

      <div className="workspace-answer-footer mt-5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <p className="text-muted mr-1 text-[0.72rem]">{copy.wasThisHelpful}</p>
          <button
            type="button"
            onClick={() => onHelpful("up")}
            aria-pressed={helpful === "up"}
            aria-label={copy.helpful}
            className={`inline-flex size-7 cursor-pointer items-center justify-center rounded-full ${
              helpful === "up"
                ? "bg-[var(--workspace-accent-soft)] text-[var(--workspace-accent-ink)]"
                : "text-muted hover:text-foreground"
            }`}
          >
            <ThumbUpIcon className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onHelpful("down")}
            aria-pressed={helpful === "down"}
            aria-label={copy.notHelpful}
            className={`inline-flex size-7 cursor-pointer items-center justify-center rounded-full ${
              helpful === "down"
                ? "bg-[#f8ece9] text-[#8a3a30]"
                : "text-muted hover:text-foreground"
            }`}
          >
            <ThumbDownIcon className="size-3.5" />
          </button>
        </div>
        <button
          type="button"
          onClick={onOpenSources}
          className="text-muted hover:text-foreground inline-flex cursor-pointer items-center gap-1.5 rounded-full px-1.5 py-1 text-[0.74rem] font-medium min-[900px]:hidden"
        >
          <SourcesMarkIcon className="size-3.5" />
          {sourcesLabel}
        </button>
      </div>
    </article>
  );
}

function PendingAnswer({
  copy,
  createdAtLabel,
}: {
  copy: ConversationCopy;
  createdAtLabel?: string;
}) {
  return (
    <article className="workspace-answer-card workspace-answer-pending">
      <AnswerIdentity createdAtLabel={createdAtLabel} />
      <p className="text-muted mt-4 text-[0.8rem]">{copy.pendingLabel}</p>
      <div className="mt-3 flex flex-col gap-2">
        <div className="workspace-pending-bar w-[88%]" />
        <div className="workspace-pending-bar w-[72%]" />
        <div className="workspace-pending-bar w-[58%]" />
      </div>
    </article>
  );
}

function AnswerIdentity({
  createdAtLabel,
  evidenceLabel,
}: {
  createdAtLabel?: string;
  evidenceLabel?: string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-2.5">
      <Image
        src="/brand/omniaskai-logo.png"
        alt=""
        width={28}
        height={28}
        className="mt-0.5 size-7 shrink-0 rounded-[0.55rem] ring-1 ring-black/6"
      />
      <div className="min-w-0">
        <p className="text-[0.86rem] font-semibold tracking-tight">
          OmniAskAI
          {createdAtLabel ? (
            <span className="text-muted font-normal">
              {" "}
              · {createdAtLabel}
            </span>
          ) : null}
        </p>
        {evidenceLabel ? (
          <p className="text-[var(--workspace-accent-ink)] mt-0.5 inline-flex items-center gap-1 text-[0.7rem] font-medium">
            <ShieldIcon className="size-3.5 shrink-0" />
            {evidenceLabel}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function CitationRow({
  locale,
  ids,
  catalog,
  displayById,
  selectedSourceId,
  onCitation,
}: {
  locale: Locale;
  ids?: string[];
  catalog: ConversationSource[];
  displayById: Map<string, number>;
  selectedSourceId: string | null;
  onCitation: (sourceId: string) => void;
}) {
  if (!ids || ids.length === 0) {
    return null;
  }

  return (
    <span className="ml-0.5 inline-flex flex-wrap gap-0.5 align-middle">
      {ids.map((id) => {
        const source = sourceById(catalog, id);
        const display = displayById.get(id);

        if (!source || display === undefined) {
          return null;
        }

        return (
          <button
            key={id}
            type="button"
            className="citation-chip"
            aria-label={formatLocalizedCount(display, locale)}
            aria-pressed={selectedSourceId === id}
            onClick={() => onCitation(id)}
          >
            [{formatLocalizedCount(display, locale)}]
          </button>
        );
      })}
    </span>
  );
}
