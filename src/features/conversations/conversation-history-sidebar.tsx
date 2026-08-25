import Image from "next/image";
import Link from "next/link";

import type { Conversation } from "./conversation";
import type { ConversationCopy } from "./conversation-language";
import {
  CalculatorIcon,
  CollapseSidebarIcon,
  CrownIcon,
  ExpandSidebarIcon,
  GuideIcon,
  PlusIcon,
  ScenariosIcon,
  SearchIcon,
  UpdatesIcon,
} from "./conversation-icons";

const exploreIcons = {
  guides: GuideIcon,
  calculators: CalculatorIcon,
  updates: UpdatesIcon,
  scenarios: ScenariosIcon,
} as const;

const railToggleClassName =
  "text-muted hover:bg-white hover:text-foreground focus-visible:outline-brand inline-flex size-8 cursor-pointer items-center justify-center rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2";

type ConversationHistorySidebarProps = {
  searchInputId: string;
  copy: ConversationCopy;
  exploreItemIds: string[];
  exploreLabels: Record<string, string>;
  conversations: Conversation[];
  activeConversationId: string | null;
  search: string;
  onSearchChange: (value: string) => void;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onCollapse?: () => void;
  onExpand?: () => void;
  collapsed?: boolean;
  showCollapse?: boolean;
};

export function ConversationHistorySidebar({
  copy,
  exploreItemIds,
  exploreLabels,
  conversations,
  activeConversationId,
  search,
  searchInputId,
  onSearchChange,
  onSelectConversation,
  onNewConversation,
  onCollapse,
  onExpand,
  collapsed = false,
  showCollapse = false,
}: ConversationHistorySidebarProps) {
  if (collapsed) {
    return (
      <div className="flex h-full min-h-0 flex-col items-center bg-[#f7f8fb] py-3">
        <Link href="/" aria-label="OmniAskAI" className="flex size-9 items-center justify-center">
          <Image
            src="/brand/omniaskai-logo.png"
            alt="OmniAskAI"
            width={28}
            height={28}
            className="size-7"
          />
        </Link>
        <button
          type="button"
          onClick={onNewConversation}
          className="bg-brand-soft text-brand mt-3 inline-flex size-9 cursor-pointer items-center justify-center rounded-full"
          aria-label={copy.newConversation}
        >
          <PlusIcon className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={onExpand}
          title={copy.expandSidebar}
          aria-label={copy.expandSidebar}
          className={`${railToggleClassName} mt-3`}
        >
          <ExpandSidebarIcon className="size-4" />
        </button>
      </div>
    );
  }

  const query = search.trim().toLowerCase();
  const visible = query
    ? conversations.filter((item) => item.title.toLowerCase().includes(query))
    : conversations;
  const today = visible.filter((item) => item.bucket === "today");
  const previous = visible.filter((item) => item.bucket === "previous7Days");

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#f7f8fb]">
      <div className="flex items-center gap-2 px-3 pt-3 pb-2">
        <Link href="/" className="flex min-w-0 flex-1 items-center gap-2">
          <Image
            src="/brand/omniaskai-logo.png"
            alt=""
            width={28}
            height={28}
            className="size-7"
          />
          <span className="text-[0.9rem] font-semibold tracking-tight">
            OmniAskAI
          </span>
        </Link>
        {showCollapse && onCollapse ? (
          <button
            type="button"
            onClick={onCollapse}
            title={copy.collapseSidebar}
            aria-label={copy.collapseSidebar}
            className={railToggleClassName}
          >
            <CollapseSidebarIcon className="size-4" />
          </button>
        ) : null}
      </div>

      <div className="px-3 pb-2.5">
        <button
          type="button"
          onClick={onNewConversation}
          className="bg-brand-soft text-brand flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-[0.8rem] font-semibold"
        >
          <PlusIcon className="size-3.5" />
          {copy.newConversation}
        </button>
      </div>

      <div className="px-3 pb-2.5">
        <label className="sr-only" htmlFor={searchInputId}>
          {copy.searchLabel}
        </label>
        <div className="border-border bg-white/80 flex items-center gap-2 rounded-full border px-3 py-1.5">
          <SearchIcon className="text-muted size-3.5 shrink-0" />
          <input
            id={searchInputId}
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={copy.searchConversations}
            className="text-foreground min-w-0 flex-1 bg-transparent text-[0.78rem] outline-none placeholder:text-[#8b909c]"
          />
        </div>
      </div>

      <nav
        aria-label={copy.searchLabel}
        className="min-h-0 flex-1 overflow-y-auto px-2 pb-3"
      >
        {query && visible.length === 0 ? (
          <p className="text-muted px-2 py-3 text-[0.78rem]">
            {copy.noMatchingConversations}
          </p>
        ) : null}

        <HistoryBucket
          label={copy.today}
          items={today}
          activeId={activeConversationId}
          onSelect={onSelectConversation}
        />
        <HistoryBucket
          label={copy.previous7Days}
          items={previous}
          activeId={activeConversationId}
          onSelect={onSelectConversation}
        />
      </nav>

      <div className="mt-auto px-3 pb-2">
        <p className="text-muted px-1 pb-1 text-[0.62rem] font-semibold tracking-wide uppercase">
          {copy.exploreThisTopic}
        </p>
        <ul className="flex flex-col">
          {exploreItemIds.map((id) => {
            const Icon =
              exploreIcons[id as keyof typeof exploreIcons] ?? GuideIcon;
            const label = exploreLabels[id] ?? id;

            return (
              <li key={id}>
                <button
                  type="button"
                  disabled
                  title={copy.unavailable}
                  aria-label={`${label}. ${copy.unavailable}`}
                  className="text-muted flex w-full cursor-not-allowed items-center gap-2 rounded-md px-2 py-1 text-left text-[0.74rem] opacity-75"
                >
                  <Icon className="size-3.5 shrink-0" />
                  {label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mx-3 mb-3 flex items-center gap-1.5 px-1 py-1">
        <CrownIcon className="size-3.5 shrink-0 text-[#b8892d]" />
        <p className="text-muted min-w-0 text-[0.7rem] leading-snug">
          {copy.goDeeper}
        </p>
      </div>
    </div>
  );
}

function HistoryBucket({
  label,
  items,
  activeId,
  onSelect,
}: {
  label: string;
  items: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mb-3">
      <p className="text-muted px-2 py-1 text-[0.62rem] font-semibold tracking-wide uppercase">
        {label}
      </p>
      <ul className="flex flex-col gap-0.5">
        {items.map((item) => {
          const current = item.id === activeId;

          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelect(item.id)}
                aria-current={current ? "true" : undefined}
                className="workspace-history-item hover:bg-white/80 flex w-full cursor-pointer items-start justify-between gap-2 rounded-lg px-2 py-1.5 text-left"
              >
                <span className="text-foreground line-clamp-2 text-[0.76rem] leading-snug">
                  {item.title}
                </span>
                <span className="text-muted shrink-0 pt-0.5 text-[0.62rem]">
                  {item.happenedAtLabel}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
