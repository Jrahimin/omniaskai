"use client";

import { useState } from "react";

import { topicThemeKeys } from "@/features/topics/topic-theme";

import { adminCopy } from "./admin-copy";
import { createAdminTopicAction } from "./admin-topic-actions";

export function AdminTopicCreateForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="mt-8 flex max-w-lg flex-col gap-4 rounded-[1.2rem] border border-[var(--border)] bg-white/80 p-5"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setPending(true);
        setMessage(null);
        void createAdminTopicAction({
          slug: String(form.get("slug") ?? ""),
          themeKey: String(form.get("themeKey") ?? ""),
          title: String(form.get("title") ?? ""),
        }).then((result) => {
          if (result && !result.ok) {
            setPending(false);
            setMessage(result.message);
          }
        });
      }}
    >
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">{adminCopy.slug}</span>
        <input
          name="slug"
          required
          placeholder="income-tax"
          className="rounded-xl border border-[var(--border)] px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">{adminCopy.titleField}</span>
        <input
          name="title"
          required
          className="rounded-xl border border-[var(--border)] px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">{adminCopy.theme}</span>
        <select name="themeKey" className="rounded-xl border border-[var(--border)] px-3 py-2">
          {topicThemeKeys.map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
      </label>
      {message ? <p className="text-sm text-[#8a3a30]">{message}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="bg-brand cursor-pointer rounded-full px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {adminCopy.newTopic}
      </button>
    </form>
  );
}
