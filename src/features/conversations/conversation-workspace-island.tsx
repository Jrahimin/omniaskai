"use client";

import { useEffect, useId, useRef, useState } from "react";

import type { TopicPresentation } from "@/features/topics/topic-presentation";
import type { Locale } from "@/lib/locale/locale";

import type {
  AssistantTurn,
  ConversationTurn,
  TopicWorkspace,
} from "./conversation";
import {
  collectAnswerText,
  getActiveAssistantTurn,
  getConversationSourceIds,
  sourcesForIds,
} from "./conversation";
import { ConversationComposer } from "./conversation-composer";
import {
  formatSourcesCount,
  resolveWorkspaceGuide,
} from "./conversation-guide";
import { ConversationHistorySidebar } from "./conversation-history-sidebar";
import type { ConversationCopy, TopicIdentityCopy } from "./conversation-language";
import { CloseIcon } from "./conversation-icons";
import { ConversationSourcePanel } from "./conversation-source-panel";
import { ConversationThread } from "./conversation-thread";
import { ConversationTopicGuideDialog } from "./conversation-topic-guide-dialog";
import { ConversationTopicHeader } from "./conversation-topic-header";

const NEW_CONVERSATION_ID = "new";
const CRAMPED_QUERY = "(max-width: 899px)";
const SHEET_QUERY = "(max-width: 639px)";

type ConversationWorkspaceIslandProps = {
  locale: Locale;
  copy: ConversationCopy;
  identity: TopicIdentityCopy;
  presentation: TopicPresentation;
  workspace: TopicWorkspace;
};

export function ConversationWorkspaceIsland({
  locale,
  copy,
  identity,
  presentation,
  workspace,
}: ConversationWorkspaceIslandProps) {
  const guideTitleId = useId();
  const railSearchId = useId();
  const drawerSearchId = useId();
  const historyDialogRef = useRef<HTMLDialogElement>(null);
  const sourcesDialogRef = useRef<HTMLDialogElement>(null);
  const guideDialogRef = useRef<HTMLDialogElement>(null);

  const [cramped, setCramped] = useState(false);
  const [useSheet, setUseSheet] = useState(false);
  const [historyCollapsed, setHistoryCollapsed] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    workspace.defaultConversationId,
  );
  const [sessionTurns, setSessionTurns] = useState<
    Record<string, ConversationTurn[]>
  >({});
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [sourceTab, setSourceTab] = useState<"answer" | "conversation">(
    "answer",
  );
  const [activeAnswerId, setActiveAnswerId] = useState<string | null>(null);
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [flashingSourceId, setFlashingSourceId] = useState<string | null>(null);
  const [helpfulByAnswer, setHelpfulByAnswer] = useState<
    Record<string, "up" | "down" | null>
  >({});
  const [copiedAnswerId, setCopiedAnswerId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const guide = resolveWorkspaceGuide(copy, workspace.starterQuestions);

  useEffect(() => {
    const crampedMedia = window.matchMedia(CRAMPED_QUERY);
    const sheetMedia = window.matchMedia(SHEET_QUERY);
    const sync = () => {
      setCramped(crampedMedia.matches);
      setUseSheet(sheetMedia.matches);
    };

    sync();
    crampedMedia.addEventListener("change", sync);
    sheetMedia.addEventListener("change", sync);

    return () => {
      crampedMedia.removeEventListener("change", sync);
      sheetMedia.removeEventListener("change", sync);
    };
  }, []);

  const selectedConversation = workspace.conversations.find(
    (item) => item.id === activeConversationId,
  );
  const sessionKey = activeConversationId ?? NEW_CONVERSATION_ID;
  const turns = [
    ...(selectedConversation?.turns ?? []),
    ...(sessionTurns[sessionKey] ?? []),
  ];
  const activeAnswer = getActiveAssistantTurn(turns, activeAnswerId);
  const answerSources = sourcesForIds(
    workspace.sources,
    activeAnswer?.sourceIds ?? [],
  );
  const conversationSources = sourcesForIds(
    workspace.sources,
    getConversationSourceIds(turns),
  );
  const visibleSourceCount =
    sourceTab === "answer" ? answerSources.length : conversationSources.length;
  const sourcesHeading =
    visibleSourceCount > 0
      ? formatSourcesCount(visibleSourceCount, copy.sourcesCount, locale)
      : copy.sources;
  const mobileSourcesLabel =
    answerSources.length > 0
      ? formatSourcesCount(answerSources.length, copy.sourcesCount, locale)
      : copy.sources;

  function closeDialog(ref: { current: HTMLDialogElement | null }) {
    ref.current?.close();
  }

  function isCrampedViewport() {
    return window.matchMedia(CRAMPED_QUERY).matches;
  }

  function openHistory() {
    historyDialogRef.current?.showModal();
  }

  function openSourcesPanel() {
    if (isCrampedViewport()) {
      sourcesDialogRef.current?.showModal();
    }
  }

  function flashSource(sourceId: string) {
    setFlashingSourceId(sourceId);
    window.setTimeout(() => {
      setFlashingSourceId((current) => (current === sourceId ? null : current));
    }, 200);
  }

  function revealSourceCard(sourceId: string) {
    const cards = document.querySelectorAll<HTMLElement>(
      `[data-source-card="${sourceId}"]`,
    );

    for (const card of cards) {
      if (card.getClientRects().length > 0) {
        card.scrollIntoView({
          block: "nearest",
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "auto"
            : "smooth",
        });
        return;
      }
    }
  }

  function selectConversation(id: string) {
    setActiveConversationId(id);
    setActiveAnswerId(null);
    setSelectedSourceId(null);
    setSourceTab("answer");
    setDraft("");
    closeDialog(historyDialogRef);
  }

  function startNewConversation() {
    setActiveConversationId(null);
    setActiveAnswerId(null);
    setSelectedSourceId(null);
    setSourceTab("answer");
    setDraft("");
    closeDialog(historyDialogRef);
  }

  function handleCitation(answerId: string, sourceId: string) {
    setActiveAnswerId(answerId);
    setSelectedSourceId(sourceId);
    setSourceTab("answer");
    openSourcesPanel();
    flashSource(sourceId);

    window.requestAnimationFrame(() => {
      revealSourceCard(sourceId);
    });
  }

  function handleOpenSources(answerId: string) {
    setActiveAnswerId(answerId);
    setSourceTab("answer");
    openSourcesPanel();
  }

  function handleFollowUp(text: string) {
    setDraft(text);
    document.getElementById("workspace-composer")?.focus();
  }

  function handleGuideExample(question: string) {
    handleFollowUp(question);
    closeDialog(guideDialogRef);
  }

  function handleCopy(turn: AssistantTurn) {
    const text = collectAnswerText(turn);

    void navigator.clipboard.writeText(text).then(() => {
      setCopiedAnswerId(turn.id);
      window.setTimeout(() => {
        setCopiedAnswerId((current) => (current === turn.id ? null : current));
      }, 1600);
    });
  }

  function handleSubmit() {
    const text = draft.trim();

    if (!text || pending) {
      return;
    }

    const nowLabel = "Just now";
    const userId = `user-${Date.now()}`;
    const pendingId = `pending-${Date.now()}`;
    const userTurn: ConversationTurn = {
      id: userId,
      role: "user",
      text,
      createdAtLabel: nowLabel,
    };
    const pendingTurn: AssistantTurn = {
      id: pendingId,
      role: "assistant",
      status: "pending",
      blocks: [],
      sourceIds: [],
      followUps: [],
    };

    setDraft("");
    setPending(true);
    setSessionTurns((current) => ({
      ...current,
      [sessionKey]: [...(current[sessionKey] ?? []), userTurn, pendingTurn],
    }));
    setActiveAnswerId(pendingId);

    const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? 120
      : 700;

    window.setTimeout(() => {
      const reply: AssistantTurn = {
        ...workspace.cannedReply,
        id: pendingId,
      };

      setSessionTurns((current) => ({
        ...current,
        [sessionKey]: (current[sessionKey] ?? []).map((turn) =>
          turn.id === pendingId ? reply : turn,
        ),
      }));
      setActiveAnswerId(pendingId);
      setPending(false);
    }, delay);
  }

  function renderHistory(
    showCollapse: boolean,
    searchInputId: string,
    collapsed: boolean,
  ) {
    return (
      <ConversationHistorySidebar
        copy={copy}
        searchInputId={searchInputId}
        exploreItemIds={workspace.exploreItemIds}
        exploreLabels={identity.exploreItems}
        conversations={workspace.conversations}
        activeConversationId={activeConversationId}
        search={search}
        onSearchChange={setSearch}
        onSelectConversation={selectConversation}
        onNewConversation={startNewConversation}
        onCollapse={() => setHistoryCollapsed(true)}
        onExpand={() => setHistoryCollapsed(false)}
        showCollapse={showCollapse}
        collapsed={collapsed}
      />
    );
  }

  function renderSources(showClose: boolean) {
    return (
      <ConversationSourcePanel
        copy={copy}
        tab={sourceTab}
        onTabChange={setSourceTab}
        answerSources={answerSources}
        conversationSources={conversationSources}
        selectedSourceId={selectedSourceId}
        flashingSourceId={flashingSourceId}
        heading={sourcesHeading}
        onSelectSource={(id) => {
          setSelectedSourceId(id);
          setActiveAnswerId(activeAnswer?.id ?? null);
          flashSource(id);
        }}
        onClose={() => closeDialog(sourcesDialogRef)}
        showClose={showClose}
      />
    );
  }

  return (
    <div
      className="workspace-canvas"
      data-mood={presentation.mood}
      data-cramped={cramped ? "true" : "false"}
      data-history-collapsed={historyCollapsed && !cramped ? "true" : "false"}
    >
      <div className="workspace-grid">
        <aside className="workspace-history">
          {renderHistory(true, railSearchId, historyCollapsed && !cramped)}
        </aside>

        <ConversationTopicHeader
          locale={locale}
          copy={copy}
          identity={identity}
          presentation={presentation}
          guide={guide}
          onOpenHistory={openHistory}
          onNewConversation={startNewConversation}
          onOpenGuide={() => guideDialogRef.current?.showModal()}
          onOpenSources={() => {
            if (activeAnswer) {
              handleOpenSources(activeAnswer.id);
            } else {
              openSourcesPanel();
            }
          }}
          sourcesCountLabel={mobileSourcesLabel}
        />

        <div className="workspace-body">
          <div className="workspace-thread flex min-h-0 flex-col">
            <main
              id="main"
              tabIndex={-1}
              className="workspace-reading min-h-0 flex-1 overflow-y-auto px-4 py-4 min-[1024px]:px-6"
            >
              <ConversationThread
                locale={locale}
                copy={copy}
                turns={turns}
                catalog={workspace.sources}
                starters={workspace.starterQuestions}
                activeAnswerId={activeAnswer?.id ?? null}
                selectedSourceId={selectedSourceId}
                helpfulByAnswer={helpfulByAnswer}
                copiedAnswerId={copiedAnswerId}
                onCitation={handleCitation}
                onOpenSources={handleOpenSources}
                onCopy={handleCopy}
                onHelpful={(answerId, value) =>
                  setHelpfulByAnswer((current) => ({
                    ...current,
                    [answerId]: current[answerId] === value ? null : value,
                  }))
                }
                onFollowUp={handleFollowUp}
              />
            </main>
            <ConversationComposer
              copy={copy}
              placeholder={identity.composerPlaceholder}
              value={draft}
              disabled={pending}
              onChange={setDraft}
              onSubmit={handleSubmit}
            />
          </div>
          <aside
            className="workspace-sources workspace-sources-rail border-border border-l"
            aria-label={copy.sources}
          >
            {renderSources(false)}
          </aside>
        </div>
      </div>

      <dialog
        ref={historyDialogRef}
        className="workspace-drawer"
        data-side="left"
        aria-label={copy.searchLabel}
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className="flex justify-end px-2 pt-2">
            <button
              type="button"
              onClick={() => closeDialog(historyDialogRef)}
              className="text-muted hover:text-foreground inline-flex size-8 cursor-pointer items-center justify-center rounded-full"
              aria-label={copy.closeHistory}
            >
              <CloseIcon className="size-3.5" />
            </button>
          </div>
          <div className="min-h-0 flex-1">
            {renderHistory(false, drawerSearchId, false)}
          </div>
        </div>
      </dialog>

      <dialog
        ref={sourcesDialogRef}
        className={useSheet ? "workspace-sheet" : "workspace-drawer"}
        data-side="right"
        aria-label={copy.sources}
      >
        {renderSources(true)}
      </dialog>

      <dialog
        ref={guideDialogRef}
        className="workspace-about p-0"
        aria-labelledby={guideTitleId}
      >
        <ConversationTopicGuideDialog
          guide={guide}
          closeLabel={copy.close}
          titleId={guideTitleId}
          onClose={() => closeDialog(guideDialogRef)}
          onExample={handleGuideExample}
        />
      </dialog>
    </div>
  );
}
