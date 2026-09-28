"use client";

import { useOptimistic, useTransition } from "react";

import type { Locale } from "./locale";
import { localeShortLabels } from "./locale";
import { setLocaleFromForm } from "./set-locale";

type LanguageSwitchProps = {
  locale: Locale;
  ariaLabel: string;
  pendingLabel?: string;
};

export function LanguageSwitch({
  locale,
  ariaLabel,
  pendingLabel,
}: LanguageSwitchProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticLocale, setOptimisticLocale] = useOptimistic(locale);
  const status =
    pendingLabel ??
    (optimisticLocale === "bn" ? "ভাষা বদলাচ্ছে" : "Updating language");

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          const value = formData.get("locale");

          if (value === "en" || value === "bn") {
            setOptimisticLocale(value);
          }

          await setLocaleFromForm(formData);
        });
      }}
      aria-label={ariaLabel}
      aria-busy={isPending}
      data-locale={optimisticLocale}
      data-pending={isPending ? "true" : "false"}
      className="locale-switch"
    >
      <span aria-hidden="true" className="locale-switch-pill" />
      <button
        name="locale"
        type="submit"
        value="en"
        aria-pressed={optimisticLocale === "en"}
        disabled={isPending}
      >
        {localeShortLabels.en}
      </button>
      <button
        name="locale"
        type="submit"
        value="bn"
        aria-pressed={optimisticLocale === "bn"}
        disabled={isPending}
      >
        {localeShortLabels.bn}
      </button>
      <span className="sr-only" role="status">
        {isPending ? status : ""}
      </span>
    </form>
  );
}
