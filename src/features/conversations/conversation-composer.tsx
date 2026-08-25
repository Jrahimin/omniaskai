"use client";

import { useLayoutEffect, useRef, useState } from "react";

import type { ConversationCopy } from "./conversation-language";
import { SendIcon } from "./conversation-icons";

type ConversationComposerProps = {
  copy: ConversationCopy;
  placeholder: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

export function ConversationComposer({
  copy,
  placeholder,
  value,
  disabled = false,
  onChange,
  onSubmit,
}: ConversationComposerProps) {
  const [language, setLanguage] = useState("auto");
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const canSend = value.trim().length > 0 && !disabled;

  useLayoutEffect(() => {
    const field = fieldRef.current;

    if (!field) {
      return;
    }

    field.style.height = "auto";
    field.style.height = `${Math.min(field.scrollHeight, 136)}px`;
  }, [value]);

  return (
    <div className="px-3 pb-2.5 min-[1024px]:px-4">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (canSend) {
            onSubmit();
          }
        }}
        className="border-border flex items-end gap-2 rounded-[1.15rem] border bg-white px-2.5 py-1.5 shadow-[0_8px_24px_rgba(22,28,48,0.06)]"
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
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              if (canSend) {
                onSubmit();
              }
            }
          }}
          className="text-foreground max-h-[8.5rem] min-h-[2.15rem] w-full resize-none bg-transparent px-1 py-1.5 text-[0.88rem] leading-relaxed outline-none placeholder:text-[#8b909c]"
        />
        <div className="mb-0.5 flex shrink-0 items-center gap-1">
          <label className="sr-only" htmlFor="composer-language">
            {copy.composerLanguage}
          </label>
          <select
            id="composer-language"
            value={language}
            title={copy.composerLanguageHint}
            onChange={(event) => setLanguage(event.target.value)}
            className="text-muted focus-visible:outline-brand max-w-[4.6rem] cursor-pointer bg-transparent py-1 text-[0.68rem] font-medium outline-none focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <option value="auto">{copy.languageAuto}</option>
            <option value="en">{copy.languageEn}</option>
            <option value="bn">{copy.languageBn}</option>
            <option value="banglish">{copy.languageBanglish}</option>
          </select>
          <button
            type="submit"
            disabled={!canSend}
            aria-label={copy.send}
            className="bg-brand text-surface inline-flex size-8 cursor-pointer items-center justify-center rounded-full disabled:cursor-not-allowed disabled:opacity-45"
          >
            <SendIcon className="size-3.5" />
          </button>
        </div>
      </form>
      <p className="text-muted mt-1.5 text-center text-[0.65rem]">
        {copy.disclaimer}
      </p>
    </div>
  );
}
