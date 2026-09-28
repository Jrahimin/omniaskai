"use client";

import { useEffect, useId, useReducer, useRef, useState } from "react";

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
  isUserTurn,
  sourcesForIds,
} from "./conversation";
import { ConversationComposer } from "./conversation-composer";
import {
  formatEvidenceCounts,
  resolveWorkspaceGuide,
} from "./conversation-guide";
import { ConversationHistorySidebar } from "./conversation-history-sidebar";
import type { ConversationCopy, TopicIdentityCopy } from "./conversation-language";
import { CloseIcon } from "./conversation-icons";
import {
  emptyWorkspaceSession,
  workspaceSessionReducer,
} from "./conversation-session-reducer";
import { ConversationSourcePanel } from "./conversation-source-panel";
import { readConversationTurnStream } from "./conversation-stream-client";
import { ConversationThread } from "./conversation-thread";
import { ConversationTopicGuideDialog } from "./conversation-topic-guide-dialog";
import { ConversationTopicHeader } from "./conversation-topic-header";
import { groupSourcesByDocument } from "./group-conversation-sources";
import { resolveTopicOpening } from "./topic-opening";

const CRAMPED_QUERY = "(max-width: 899px)";
const SHEET_QUERY = "(max-width: 639px)";
const EMPTY_TURNS: ConversationTurn[] = [];

type ConversationWorkspaceIslandProps = {
  locale: Locale;
  copy: ConversationCopy;
  identity: TopicIdentityCopy;
  presentation: TopicPresentation;
  workspace: TopicWorkspace;
  conversationEnabled?: boolean;
};

export function ConversationWorkspaceIsland({
  locale,
  copy,
  identity,
  presentation,
  workspace,
  conversationEnabled = true,
}: ConversationWorkspaceIslandProps) {
  const guideTitleId = useId();
  const railSearchId = useId();
  const drawerSearchId = useId();
  const historyDialogRef = useRef<HTMLDialogElement>(null);
  const sourcesDialogRef = useRef<HTMLDialogElement>(null);
  const guideDialogRef = useRef<HTMLDialogElement>(null);
  const readingRef = useRef<HTMLElement>(null);
  const followLatestRef = useRef(true);
  const abortRef = useRef<AbortController | null>(null);
  const operationSeq = useRef(0);

  const [cramped, setCramped] = useState(false);
  const [useSheet, setUseSheet] = useState(false);
  const [historyCollapsed, setHistoryCollapsed] = useState(true);
  const [session, dispatch] = useReducer(
    workspaceSessionReducer,
    emptyWorkspaceSession,
  );
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
  const [helpfulPendingId, setHelpfulPendingId] = useState<string | null>(null);
  const [helpfulErrorByAnswer, setHelpfulErrorByAnswer] = useState<
    Record<string, true>
  >({});
  const [copiedAnswerId, setCopiedAnswerId] = useState<string | null>(null);

  const opening = resolveTopicOpening({
    slug: workspace.topicSlug,
    locale,
    identity,
    copy,
    starters: workspace.starterQuestions,
  });
  const guide = resolveWorkspaceGuide(
    copy,
    opening.guideQuestions,
    identity.aboutBody,
  );
  const pending = session.operationId !== null;
  const activeConversationBlocked = session.activeConversationId
    ? session.blockedConversationIds[session.activeConversationId] === true
    : false;

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

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const selectedConversation = session.conversations.find(
    (item) => item.id === session.activeConversationId,
  );
  const turns = selectedConversation?.turns ?? EMPTY_TURNS;

  useEffect(() => {
    const reading = readingRef.current;
    if (reading) {
      if (turns.length === 0) {
        reading.scrollTop = 0;
      } else if (followLatestRef.current) {
        reading.scrollTop = reading.scrollHeight;
      }
    }
  }, [turns]);
  const hasAnswer = turns.some(
    (turn) => turn.role === "assistant" && turn.status !== "pending",
  );
  const activeAnswer = getActiveAssistantTurn(turns, activeAnswerId);
  const answerSources = sourcesForIds(
    session.sources,
    activeAnswer?.sourceIds ?? [],
  );
  const conversationSources = sourcesForIds(
    session.sources,
    getConversationSourceIds(turns),
  );
  const visibleSources =
    sourceTab === "answer" ? answerSources : conversationSources;
  const groupedSourceCount = groupSourcesByDocument(visibleSources).length;
  const sourcesHeading =
    visibleSources.length > 0
      ? formatEvidenceCounts(
          groupedSourceCount,
          visibleSources.length,
          copy.evidenceCounts,
          groupedSourceCount === 1 ? copy.sourceCountOne : copy.sourcesCount,
          visibleSources.length === 1
            ? copy.referenceCountOne
            : copy.referencesCount,
          locale,
        )
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
    }, 520);
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

  function abortActive() {
    abortRef.current?.abort();
    abortRef.current = null;
  }

  function selectConversation(id: string) {
    abortActive();
    followLatestRef.current = true;
    dispatch({ type: "select-conversation", conversationId: id });
    setActiveAnswerId(null);
    setSelectedSourceId(null);
    setSourceTab("answer");
    setDraft("");
    closeDialog(historyDialogRef);
  }

  function startNewConversation() {
    abortActive();
    followLatestRef.current = true;
    dispatch({ type: "new-conversation" });
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
    if (!conversationEnabled) {
      return;
    }

    setDraft(text);
    document.getElementById("workspace-composer")?.focus();
  }

  async function handleHelpful(answerId: string, value: "up" | "down") {
    const conversationId = session.activeConversationId;
    const conversation = session.conversations.find(
      (item) => item.id === conversationId,
    );
    const turn = conversation?.turns.find(
      (item) => item.id === answerId && item.role === "assistant",
    );
    const operationId =
      turn && turn.role === "assistant" ? turn.publicOperationId : undefined;
    const continuationToken = conversationId
      ? session.continuationTokens[conversationId]
      : undefined;

    if (!operationId || !continuationToken) {
      setHelpfulErrorByAnswer((current) => ({ ...current, [answerId]: true }));
      return;
    }

    const previous = helpfulByAnswer[answerId] ?? null;
    const next = previous === value ? null : value;
    setHelpfulPendingId(answerId);
    setHelpfulErrorByAnswer((current) => {
      const nextErrors = { ...current };
      delete nextErrors[answerId];
      return nextErrors;
    });
    setHelpfulByAnswer((current) => ({ ...current, [answerId]: next }));

    try {
      const response = await fetch(
        `/api/conversation-turns/${operationId}/feedback`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            continuationToken,
            rating: next,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("feedback");
      }
    } catch {
      setHelpfulByAnswer((current) => ({ ...current, [answerId]: previous }));
      setHelpfulErrorByAnswer((current) => ({ ...current, [answerId]: true }));
    } finally {
      setHelpfulPendingId((current) => (current === answerId ? null : current));
    }
  }

  function handleGuideExample(question: string) {
    if (!conversationEnabled) {
      return;
    }

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

  function handleStop() {
    const conversation = session.conversations.find(
      (item) => item.id === session.activeConversationId,
    );
    const assistantId = session.inFlightAssistantId;
    const userTurn = conversation?.turns.find((turn, index, all) => {
      const next = all[index + 1];
      return (
        isUserTurn(turn) &&
        next &&
        next.role === "assistant" &&
        next.id === assistantId
      );
    });

    abortActive();
    dispatch({ type: "stop" });

    if (!draft.trim() && userTurn && isUserTurn(userTurn)) {
      setDraft(userTurn.text);
    }
  }

  function handleSubmit() {
    const text = draft;

    if (
      !conversationEnabled ||
      !text.trim() ||
      pending ||
      activeConversationBlocked
    ) {
      return;
    }

    abortActive();
    followLatestRef.current = true;
    operationSeq.current += 1;
    const operationId = String(operationSeq.current);
    const abort = new AbortController();
    abortRef.current = abort;

    const conversationId = session.activeConversationId ?? crypto.randomUUID();
    const userId = crypto.randomUUID();
    const assistantId = crypto.randomUUID();
    const nowLabel = formatClock(locale);
    const continuationToken = session.activeConversationId
      ? session.continuationTokens[session.activeConversationId]
      : undefined;
    const userTurn: ConversationTurn = {
      id: userId,
      role: "user",
      text,
      createdAtLabel: nowLabel,
    };
    const pendingTurn: AssistantTurn = {
      id: assistantId,
      role: "assistant",
      status: "pending",
      blocks: [],
      sourceIds: [],
      followUps: [],
    };

    setDraft("");
    setActiveAnswerId(assistantId);
    dispatch({
      type: "submit",
      operationId,
      conversationId,
      title: text,
      happenedAtLabel: nowLabel,
      userTurn,
      pendingTurn,
    });

    void (async () => {
      try {
        const response = await fetch(
          `/api/topics/${workspace.topicSlug}/conversation-turns`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "text/event-stream",
            },
            body: JSON.stringify({
              question: text,
              continuationToken,
            }),
            signal: abort.signal,
          },
        );

        if (!response.ok) {
          dispatch({ type: "error", operationId, retryable: true });
          return;
        }

        await readConversationTurnStream(
          response,
          {
            onConversation: (token) => {
              dispatch({
                type: "conversation",
                operationId,
                continuationToken: token,
              });
            },
            onToken: (delta) => {
              dispatch({ type: "token", operationId, delta });
            },
            onFinal: (payload) => {
              dispatch({ type: "final", operationId, payload });
            },
            onError: (retryableBeforeAcceptance) => {
              dispatch({
                type: "error",
                operationId,
                retryable:
                  retryableBeforeAcceptance && continuationToken === undefined,
              });
            },
          },
          abort.signal,
        );
      } catch (error) {
        if (abort.signal.aborted || isAbortError(error)) {
          return;
        }

        dispatch({ type: "error", operationId, retryable: false });
      }
    })();
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
        conversations={session.conversations}
        activeConversationId={session.activeConversationId}
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
        locale={locale}
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

  function renderComposer() {
    return (
      <ConversationComposer
        copy={copy}
        placeholder={identity.composerPlaceholder}
        value={draft}
        disabled={!conversationEnabled || activeConversationBlocked}
        busy={pending}
        hasConversation={turns.length > 0}
        onChange={setDraft}
        onSubmit={handleSubmit}
        onStop={handleStop}
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
          opening={opening}
          showIntro={turns.length === 0}
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
          sourcesCountLabel={hasAnswer ? copy.conversationSourcesAction : undefined}
        />

        <div className="workspace-body">
          <div className="workspace-thread flex min-h-0 flex-col">
            <main
              id="main"
              ref={readingRef}
              tabIndex={-1}
              onScroll={(event) => {
                const reading = event.currentTarget;
                followLatestRef.current = reading.scrollHeight - reading.scrollTop - reading.clientHeight < 120;
              }}
              className="workspace-reading min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-4 pt-3 pb-6 min-[1024px]:px-6"
            >
              <ConversationThread
                locale={locale}
                copy={copy}
                turns={turns}
                catalog={session.sources}
                opening={opening}
                activeAnswerId={activeAnswer?.id ?? null}
                selectedSourceId={selectedSourceId}
                helpfulByAnswer={helpfulByAnswer}
                helpfulPendingId={helpfulPendingId}
                helpfulErrorByAnswer={helpfulErrorByAnswer}
                copiedAnswerId={copiedAnswerId}
                onCitation={handleCitation}
                onOpenSources={handleOpenSources}
                onCopy={handleCopy}
                onHelpful={handleHelpful}
                onFollowUp={handleFollowUp}
              />
            </main>
            {renderComposer()}
          </div>
          <aside
            className="workspace-sources workspace-sources-rail"
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

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException
    ? error.name === "AbortError"
    : error instanceof Error && error.name === "AbortError";
}

function formatClock(locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-GB", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date());
}
