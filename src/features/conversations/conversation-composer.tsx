"use client";

import { useLayoutEffect, useRef } from "react";

import type { ConversationCopy } from "./conversation-language";
import { SendIcon, SparkSmallIcon } from "./conversation-icons";

type ConversationComposerProps = {
  copy: ConversationCopy;
  placeholder: string;
  value: string;
  disabled?: boolean;
  busy?: boolean;
  hasConversation?: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onStop?: () => void;
};

export function ConversationComposer({
  copy,
  placeholder,
  value,
  disabled = false,
  busy = false,
  hasConversation = false,
  onChange,
  onSubmit,
  onStop,
}: ConversationComposerProps) {
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const canSend = value.trim().length > 0 && !disabled && !busy;

  useLayoutEffect(() => {
    const field = fieldRef.current;

    if (!field) {
      return;
    }

    field.style.height = "auto";
    field.style.height = `${Math.min(field.scrollHeight, 136)}px`;
  }, [value]);

  return (
    <div className="workspace-composer-dock px-4 pb-3 min-[1024px]:px-6" data-busy={busy ? "true" : "false"}>
      <div className="workspace-composer-heading mx-auto flex max-w-[40rem] items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5"><SparkSmallIcon className="size-3.5" />{busy ? copy.composerBusyTitle : hasConversation ? copy.composerFollowUpTitle : copy.composerTitle}</span>
        <span className="workspace-composer-language">{copy.answerLanguage}</span>
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (canSend) {
            onSubmit();
          }
        }}
        className="workspace-composer-bar mx-auto flex max-w-[40rem] items-end gap-2 px-3 py-1.5"
      >
        <label className="sr-only" htmlFor="workspace-composer">
          {placeholder}
        </label>
        <textarea
          ref={fieldRef}
          id="workspace-composer"
          rows={1}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault();
              if (canSend) {
                onSubmit();
              }
            }
          }}
          className="text-foreground max-h-[8.5rem] min-h-[2.25rem] w-full resize-none bg-transparent px-1 py-1.5 text-base leading-relaxed outline-none placeholder:text-[#8b909c]"
        />
        <div className="mb-0.5 flex shrink-0 items-center gap-1">
          {busy && onStop ? (
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onStop();
              }}
              className="text-foreground inline-flex h-8 cursor-pointer items-center rounded-full border border-[#d9dde8] bg-white px-3 text-[0.8rem] font-semibold"
            >
              {copy.stop}
            </button>
          ) : (
            <button
              type="submit"
              disabled={!canSend}
              aria-label={copy.send}
              className="bg-brand text-surface inline-flex size-8 cursor-pointer items-center justify-center rounded-full disabled:cursor-not-allowed disabled:opacity-45"
            >
              <SendIcon className="size-3.5" />
            </button>
          )}
        </div>
      </form>
      <p className="text-muted mx-auto mt-1.5 flex max-w-[40rem] flex-wrap items-center justify-between gap-x-3 gap-y-1 px-1 text-[0.75rem]">
        <span>{copy.composerHint}</span>
      </p>
    </div>
  );
}
