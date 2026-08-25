import type { ReactNode } from "react";

import type { ConversationSource } from "./conversation";
import type { ConversationCopy } from "./conversation-language";
import { CloseIcon, ExternalIcon } from "./conversation-icons";

type SourceTab = "answer" | "conversation";

type ConversationSourcePanelProps = {
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
  const empty =
    tab === "answer" ? copy.noSourcesInAnswer : copy.noSourcesInConversation;

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="flex items-center justify-between gap-2 px-4 pt-3.5 pb-2">
        <h2 className="text-[0.92rem] font-semibold">{heading}</h2>
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
        className="border-border mx-3 flex gap-1 rounded-full border bg-[#f6f7fa] p-0.5 text-[0.66rem] leading-tight"
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

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        {sources.length === 0 ? (
          <p className="text-muted px-1 py-3 text-[0.8rem] leading-relaxed">
            {empty}
          </p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {sources.map((source) => (
              <li key={source.id}>
                <SourceCard
                  copy={copy}
                  source={source}
                  selected={selectedSourceId === source.id}
                  flashing={flashingSourceId === source.id}
                  onSelect={() => onSelectSource(source.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
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
      className={`flex-1 cursor-pointer rounded-full px-2 py-1.5 font-medium ${
        selected
          ? "bg-white text-[#1f232b] shadow-sm"
          : "text-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function SourceCard({
  copy,
  source,
  selected,
  flashing,
  onSelect,
}: {
  copy: ConversationCopy;
  source: ConversationSource;
  selected: boolean;
  flashing: boolean;
  onSelect: () => void;
}) {
  return (
    <article
      data-source-card={source.id}
      data-selected={selected ? "true" : undefined}
      data-flash={flashing ? "true" : undefined}
      className={`source-card rounded-xl ${
        selected ? "p-3" : "px-2.5 py-2"
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className="flex w-full cursor-pointer items-start gap-2 text-left"
      >
        <span
          className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[0.65rem] font-semibold ${
            selected
              ? "bg-[var(--workspace-accent)] text-surface"
              : "bg-[#eef0f4] text-[#4a5160]"
          }`}
        >
          {source.index}
        </span>
        <span className="min-w-0">
          <span className="block text-[0.8rem] leading-snug font-semibold">
            {source.title}
          </span>
          <span className="text-muted mt-0.5 block text-[0.68rem]">
            {source.publisher}
            {selected && source.year ? ` · ${source.year}` : ""}
            {selected ? ` · ${source.locator}` : ""}
          </span>
        </span>
      </button>
      {selected ? (
        <>
          <p className="text-muted mt-2 pl-7 text-[0.74rem] leading-relaxed">
            {source.excerpt}
          </p>
          {source.href ? (
            <a
              href={source.href}
              target="_blank"
              rel="noreferrer"
              className="text-[var(--workspace-accent-ink)] mt-2 ml-7 inline-flex items-center gap-1 text-[0.72rem] font-medium"
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
              className="text-muted mt-2 ml-7 inline-flex cursor-not-allowed items-center gap-1 text-[0.72rem] font-medium opacity-70"
            >
              {copy.viewSource}
              <ExternalIcon className="size-3" />
            </button>
          )}
        </>
      ) : null}
    </article>
  );
}
