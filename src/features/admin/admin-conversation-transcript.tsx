"use client";

import { useState } from "react";

import { adminCopy } from "./admin-copy";

type TranscriptMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string | null;
};

type AdminConversationTranscriptProps = {
  conversationId: string;
  initial: {
    messages: TranscriptMessage[];
    total: number;
    offset: number;
    hasMore: boolean;
  };
  feedbackByMessage: Record<string, "up" | "down">;
};

export function AdminConversationTranscript({
  conversationId,
  initial,
  feedbackByMessage,
}: AdminConversationTranscriptProps) {
  const [messages, setMessages] = useState(initial.messages);
  const [offset, setOffset] = useState(initial.offset + initial.messages.length);
  const [hasMore, setHasMore] = useState(initial.hasMore);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [truncated, setTruncated] = useState(false);

  async function loadMore() {
    setPending(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/conversations/${conversationId}/messages?offset=${offset}`,
      );
      const payload = (await response.json()) as
        | {
            status: "ok";
            messages: TranscriptMessage[];
            total: number;
            offset: number;
            hasMore: boolean;
          }
        | { status: "unavailable"; reason?: string }
        | { status: "missing"; error?: string }
        | { error?: string };

      if (!response.ok || !("status" in payload) || payload.status !== "ok") {
        setError(adminCopy.transcriptPageFailed);
        return;
      }

      setMessages((current) => [...current, ...payload.messages]);
      setOffset(payload.offset + payload.messages.length);
      setHasMore(payload.hasMore);

      if (!payload.hasMore && payload.offset + payload.messages.length < payload.total) {
        setTruncated(true);
      }
    } catch {
      setError(adminCopy.transcriptPageFailed);
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="rounded-[1.2rem] border border-[var(--border)] bg-white/80 p-5">
      <h2 className="font-semibold">Transcript</h2>
      <ol className="mt-4 flex flex-col gap-4">
        {messages.map((message) => (
          <li key={message.id}>
            <p className="text-muted text-xs uppercase">{message.role}</p>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
            {feedbackByMessage[message.id] ? (
              <p className="mt-1 text-xs">
                {feedbackByMessage[message.id] === "up"
                  ? adminCopy.feedbackUp
                  : adminCopy.feedbackDown}
              </p>
            ) : null}
          </li>
        ))}
      </ol>
      {error ? <p className="mt-4 text-sm text-[#5c3a16]">{error}</p> : null}
      {truncated ? <p className="text-muted mt-4 text-sm">{adminCopy.transcriptTruncated}</p> : null}
      {hasMore ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => void loadMore()}
          className="mt-4 cursor-pointer rounded-full border border-[var(--border)] px-3 py-2 text-sm font-medium disabled:opacity-60"
        >
          {adminCopy.loadMoreMessages}
        </button>
      ) : null}
    </section>
  );
}
