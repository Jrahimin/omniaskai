"use client";

import { useState, type ReactNode } from "react";

import type { Locale } from "@/lib/locale/locale";

import type { ConversationSource } from "./conversation";
import { citationDisplayById } from "./conversation";
import {
  formatLocalizedCount,
  formatSourcesCount,
} from "./conversation-guide";
import type { ConversationCopy } from "./conversation-language";
import {
  ChevronIcon,
  CloseIcon,
  ExternalIcon,
  FileDocIcon,
} from "./conversation-icons";
import {
  groupSourcesByDocument,
  type SourceDocumentGroup,
} from "./group-conversation-sources";

type SourceTab = "answer" | "conversation";

type ConversationSourcePanelProps = {
  locale: Locale;
  copy: ConversationCopy;
  tab: SourceTab;
  onTabChange: (tab: SourceTab) => void;
  answerSources: ConversationSource[];
  conversationSources: ConversationSource[];
  selectedSourceId: string | null;
  flashingSourceId: string | null;
  heading: string;
  onSelectSource: (id: string) => void;
  onClose?: () => void;
  showClose: boolean;
};

export function ConversationSourcePanel({
  locale,
  copy,
  tab,
  onTabChange,
  answerSources,
  conversationSources,
  selectedSourceId,
  flashingSourceId,
  heading,
  onSelectSource,
  onClose,
  showClose,
}: ConversationSourcePanelProps) {
  const sources = tab === "answer" ? answerSources : conversationSources;
  const groups = groupSourcesByDocument(sources);
  const displayById = citationDisplayById(sources.map((source) => source.id));
  const empty =
    tab === "answer" ? copy.noSourcesInAnswer : copy.noSourcesInConversation;
  const [opened, setOpened] = useState<Record<string, boolean>>({});

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-2 px-4 pt-3.5 pb-1.5">
        <h2 className="text-[0.88rem] font-semibold tracking-tight">{heading}</h2>
        {showClose && onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-foreground inline-flex size-8 cursor-pointer items-center justify-center rounded-full"
            aria-label={copy.closeSources}
          >
            <CloseIcon className="size-3.5" />
          </button>
        ) : null}
      </div>

      <div
        role="tablist"
        aria-label={copy.sources}
        className="mx-4 flex gap-4 border-b border-[#eceef3] text-[0.72rem]"
      >
        <TabButton
          selected={tab === "answer"}
          onClick={() => onTabChange("answer")}
        >
          {copy.inThisAnswer}
        </TabButton>
        <TabButton
          selected={tab === "conversation"}
          onClick={() => onTabChange("conversation")}
        >
          {copy.conversationSources}
        </TabButton>
      </div>

      <div className="workspace-pane-scroll min-h-0 flex-1 overflow-y-auto px-3 py-3">
        {groups.length === 0 ? (
          <p className="text-muted px-1 py-3 text-[0.8rem] leading-relaxed">
            {empty}
          </p>
        ) : (
          <ul className="flex flex-col">
            {groups.map((group, groupIndex) => {
              const selected = group.references.some(
                (item) => item.id === selectedSourceId,
              );
              const flashing = group.references.some(
                (item) => item.id === flashingSourceId,
              );
              const expanded =
                flashing || (opened[group.key] ?? selected);

              return (
                <li
                  key={group.key}
                  className={
                    groupIndex < groups.length - 1
                      ? "border-b border-[color-mix(in_srgb,var(--border)_55%,transparent)]"
                      : undefined
                  }
                >
                  <SourceGroupCard
                    locale={locale}
                    copy={copy}
                    group={group}
                    tone={groupIndex % 4}
                    displayById={displayById}
                    selectedSourceId={selectedSourceId}
                    selected={selected}
                    flashing={flashing}
                    expanded={expanded}
                    onToggle={() =>
                      setOpened((current) => ({
                        ...current,
                        [group.key]: !(current[group.key] ?? selected),
                      }))
                    }
                    onSelectSource={onSelectSource}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {groups.length > 0 ? (
        <p className="text-muted mx-4 mb-3 px-0.5 text-[0.65rem] leading-relaxed">
          {copy.evidenceNote}
        </p>
      ) : null}
    </div>
  );
}

function TabButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onClick}
      className={`-mb-px cursor-pointer border-b-2 px-0.5 py-2 font-medium ${
        selected
          ? "border-[var(--workspace-accent)] text-[#1f232b]"
          : "text-muted hover:text-foreground border-transparent"
      }`}
    >
      {children}
    </button>
  );
}

function SourceGroupCard({
  locale,
  copy,
  group,
  tone,
  selectedSourceId,
  selected,
  flashing,
  expanded,
  displayById,
  onToggle,
  onSelectSource,
}: {
  locale: Locale;
  copy: ConversationCopy;
  group: SourceDocumentGroup;
  tone: number;
  displayById: Map<string, number>;
  selectedSourceId: string | null;
  selected: boolean;
  flashing: boolean;
  expanded: boolean;
  onToggle: () => void;
  onSelectSource: (id: string) => void;
}) {
  const active =
    group.references.find((item) => item.id === selectedSourceId) ??
    group.references[0];

  return (
    <article
      data-selected={selected ? "true" : undefined}
      data-flash={flashing ? "true" : undefined}
      className="source-card px-2 py-2"
    >
      <div className="flex items-start gap-2">
        <span
          className="source-file-mark mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg"
          data-tone={tone}
        >
          {group.kind === "web" ? (
            <ExternalIcon className="size-3.5" />
          ) : (
            <FileDocIcon className="size-3.5" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={expanded}
            className="flex w-full cursor-pointer items-start justify-between gap-2 text-left"
          >
            <span className="min-w-0">
              <span className="block text-[0.78rem] leading-snug font-semibold break-words">
                {group.title}
              </span>
              <span className="text-muted mt-0.5 block text-[0.66rem]">
                {formatSourcesCount(
                  group.references.length,
                  copy.referencesCount,
                  locale,
                )}
              </span>
            </span>
            <ChevronIcon
              className={`text-muted mt-0.5 size-3.5 shrink-0 transition-transform ${
                expanded ? "rotate-180" : ""
              }`}
            />
          </button>
          <p className="text-muted mt-1.5 text-[0.62rem]">{copy.referencedIn}</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {group.references.map((source) => (
              <button
                key={source.id}
                type="button"
                data-source-card={source.id}
                aria-pressed={selectedSourceId === source.id}
                onClick={() => onSelectSource(source.id)}
                className={`source-index-chip ${
                  selectedSourceId === source.id ? "is-active" : ""
                }`}
              >
                {formatLocalizedCount(
                  displayById.get(source.id) ?? source.index,
                  locale,
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
      {expanded && active ? (
        <SourceExcerpt copy={copy} source={active} />
      ) : null}
    </article>
  );
}

function SourceExcerpt({
  copy,
  source,
}: {
  copy: ConversationCopy;
  source: ConversationSource;
}) {
  const meta = [source.publisher, source.year, source.locator]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="mt-2 border-t border-[color-mix(in_srgb,var(--border)_70%,transparent)] pt-2 pl-9">
      {meta ? <p className="text-muted text-[0.66rem]">{meta}</p> : null}
      {source.excerpt ? (
        <p className="text-muted mt-1 text-[0.74rem] leading-relaxed">
          {source.excerpt}
        </p>
      ) : null}
      {source.href ? (
        <a
          href={source.href}
          target="_blank"
          rel="noreferrer"
          className="text-[var(--workspace-accent-ink)] mt-1.5 inline-flex items-center gap-1 text-[0.72rem] font-medium"
        >
          {copy.viewSource}
          <ExternalIcon className="size-3" />
        </a>
      ) : (
        <button
          type="button"
          disabled
          title={copy.unavailable}
          aria-label={`${copy.viewSource}. ${copy.unavailable}`}
          className="text-muted mt-1.5 inline-flex cursor-not-allowed items-center gap-1 text-[0.72rem] font-medium opacity-70"
        >
          {copy.viewSource}
          <ExternalIcon className="size-3" />
        </button>
      )}
    </div>
  );
}
