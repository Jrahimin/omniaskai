import type { ReactNode } from "react";

import type { Locale } from "@/lib/locale/locale";

import type {
  AnswerListIcon,
  AssistantTurn,
  ConversationSource,
} from "./conversation";
import { sourceById } from "./conversation";
import { formatSourcesCount } from "./conversation-guide";
import type { ConversationCopy } from "./conversation-language";
import {
  BookIcon,
  BriefcaseIcon,
  CheckSmallIcon,
  CopyIcon,
  FilmIcon,
  HomeIcon,
  LightbulbIcon,
  SourcesMarkIcon,
  ThumbDownIcon,
  ThumbUpIcon,
  TrendIcon,
  WalletIcon,
} from "./conversation-icons";

const listIcons: Record<
  AnswerListIcon,
  (props: { className?: string }) => ReactNode
> = {
  briefcase: BriefcaseIcon,
  wallet: WalletIcon,
  home: HomeIcon,
  trend: TrendIcon,
  book: BookIcon,
  film: FilmIcon,
};

type ConversationAssistantAnswerProps = {
  locale: Locale;
  copy: ConversationCopy;
  turn: AssistantTurn;
  catalog: ConversationSource[];
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
      <article className="workspace-answer px-1 py-2">
        <p className="text-muted text-[0.78rem]">{copy.pendingLabel}</p>
        <div className="mt-3 flex flex-col gap-2">
          <div className="workspace-pending-bar w-[88%]" />
          <div className="workspace-pending-bar w-[72%]" />
          <div className="workspace-pending-bar w-[64%]" />
        </div>
      </article>
    );
  }

  if (turn.status === "error") {
    return (
      <article className="workspace-answer rounded-2xl border border-[#ead4d0] bg-[#fdf6f5] px-4 py-4">
        <AnswerIdentity copy={copy} showCue={false} />
        <h2 className="mt-3 text-[1.02rem] font-semibold">{copy.errorTitle}</h2>
        <p className="text-muted mt-1.5 text-[0.9rem] leading-relaxed">
          {copy.errorBody}
        </p>
      </article>
    );
  }

  const showCue = turn.status === "grounded" && turn.sourceIds.length > 0;
  const sourcesLabel =
    turn.sourceIds.length > 0
      ? formatSourcesCount(turn.sourceIds.length, copy.sourcesCount, locale)
      : copy.sources;

  return (
    <article
      className={`workspace-answer px-1 py-1 ${
        isActiveEvidence ? "workspace-answer-active" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <AnswerIdentity copy={copy} showCue={showCue} />
        <button
          type="button"
          onClick={onCopy}
          className="text-muted hover:text-foreground inline-flex cursor-pointer items-center gap-1 rounded-full px-1.5 py-0.5 text-[0.7rem]"
        >
          <CopyIcon className="size-3.5" />
          {copied ? copy.copied : copy.copyAnswer}
        </button>
      </div>

      <div className="mt-3 flex flex-col gap-3.5">
        {turn.blocks.map((block, index) => {
          if (block.type === "paragraph") {
            return (
              <p key={index} className="workspace-answer-copy">
                {block.text}{" "}
                <CitationRow
                  ids={block.citationIds}
                  catalog={catalog}
                  selectedSourceId={selectedSourceId}
                  onCitation={onCitation}
                />
              </p>
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
              <ol key={index} className="flex flex-col gap-3.5">
                {block.items.map((item, itemIndex) => {
                  const Icon = item.icon ? listIcons[item.icon] : BookIcon;

                  return (
                    <li key={itemIndex} className="flex gap-3">
                      <span className="bg-[var(--workspace-accent-soft)] text-[var(--workspace-accent-ink)] mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full">
                        <Icon className="size-3.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-[0.95rem] font-semibold tracking-tight">
                            {item.title}
                          </p>
                          <CitationRow
                            ids={item.citationIds}
                            catalog={catalog}
                            selectedSourceId={selectedSourceId}
                            onCitation={onCitation}
                          />
                        </div>
                        <p className="text-muted mt-0.5 text-[0.86rem] leading-relaxed">
                          {item.body}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            );
          }

          if (block.type === "callout") {
            return (
              <aside
                key={index}
                className="bg-[var(--workspace-accent-soft)] flex gap-2.5 rounded-xl px-3.5 py-3"
              >
                <LightbulbIcon className="text-[var(--workspace-accent-ink)] mt-0.5 size-4 shrink-0" />
                <p className="text-[0.86rem] leading-relaxed text-[#243028]">
                  {block.text}
                </p>
              </aside>
            );
          }

          if (block.type === "formula") {
            return (
              <p
                key={index}
                className="rounded-xl bg-[#f3faf6] px-3.5 py-3 font-mono text-[0.82rem] leading-relaxed text-[#1d3d32]"
              >
                {block.text}
              </p>
            );
          }

          return (
            <aside
              key={index}
              className="rounded-xl bg-[#fbf6ee] px-3.5 py-3"
            >
              <p className="text-[0.92rem] font-semibold">{block.title}</p>
              <p className="text-muted mt-1.5 text-[0.86rem] leading-relaxed">
                {block.body}
              </p>
            </aside>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
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
          className="text-foreground inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-[#f1f2f6] px-2.5 py-1 text-[0.74rem] font-medium"
        >
          <SourcesMarkIcon className="size-3.5" />
          {sourcesLabel}
        </button>
      </div>
    </article>
  );
}

function AnswerIdentity({
  copy,
  showCue,
}: {
  copy: ConversationCopy;
  showCue: boolean;
}) {
  return (
    <p className="flex items-center gap-2 text-[0.78rem] font-medium">
      <span className="text-foreground font-semibold">OmniAskAI</span>
      {showCue ? (
        <span className="text-[var(--workspace-accent-ink)] inline-flex items-center gap-1 text-[0.7rem] font-medium">
          <CheckSmallIcon className="size-3.5" />
          {copy.fromSources}
        </span>
      ) : null}
    </p>
  );
}

function CitationRow({
  ids,
  catalog,
  selectedSourceId,
  onCitation,
}: {
  ids?: string[];
  catalog: ConversationSource[];
  selectedSourceId: string | null;
  onCitation: (sourceId: string) => void;
}) {
  if (!ids || ids.length === 0) {
    return null;
  }

  return (
    <span className="ml-0.5 inline-flex flex-wrap gap-1 align-middle">
      {ids.map((id) => {
        const source = sourceById(catalog, id);

        if (!source) {
          return null;
        }

        return (
          <button
            key={id}
            type="button"
            className="citation-chip"
            aria-pressed={selectedSourceId === id}
            onClick={() => onCitation(id)}
          >
            {source.shortLabel}
          </button>
        );
      })}
    </span>
  );
}
