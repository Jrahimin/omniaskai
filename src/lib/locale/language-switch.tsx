"use client";

import { useOptimistic } from "react";

import type { Locale } from "./locale";
import { localeShortLabels } from "./locale";
import { setLocaleFromForm } from "./set-locale";

type LanguageSwitchProps = {
  locale: Locale;
  ariaLabel: string;
};

export function LanguageSwitch({ locale, ariaLabel }: LanguageSwitchProps) {
  const [optimisticLocale, setOptimisticLocale] = useOptimistic(locale);

  return (
    <form
      action={async (formData) => {
        const value = formData.get("locale");

        if (value === "en" || value === "bn") {
          setOptimisticLocale(value);
        }

        await setLocaleFromForm(formData);
      }}
      aria-label={ariaLabel}
      data-locale={optimisticLocale}
      className="locale-switch"
    >
      <span aria-hidden="true" className="locale-switch-pill" />
      <button
        name="locale"
        type="submit"
        value="en"
        aria-pressed={optimisticLocale === "en"}
      >
        {localeShortLabels.en}
      </button>
      <button
        name="locale"
        type="submit"
        value="bn"
        aria-pressed={optimisticLocale === "bn"}
      >
        {localeShortLabels.bn}
      </button>
    </form>
  );
}
