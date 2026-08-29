import type { Locale } from "@/lib/locale/locale";

import type { ConversationCopy, WorkspaceGuide } from "./conversation-language";

const BENGALI_DIGITS = "০১২৩৪৫৬৭৮৯";

export function resolveWorkspaceGuide(
  copy: ConversationCopy,
  exampleQuestions: string[],
): WorkspaceGuide {
  return {
    shortHint: copy.guide.shortHint,
    openLabel: copy.guide.openLabel,
    title: copy.guide.title,
    intro: copy.guide.intro,
    exampleHeading: copy.guide.exampleHeading,
    steps: copy.guide.steps,
    exampleQuestions: exampleQuestions.slice(0, 3),
  };
}

export function formatLocalizedCount(value: number, locale: Locale): string {
  const digits = String(value);

  if (locale !== "bn") {
    return digits;
  }

  return digits.replace(/\d/g, (digit) => BENGALI_DIGITS[Number(digit)]);
}

export function formatSourcesCount(
  count: number,
  template: string,
  locale: Locale,
): string {
  return template.replace("{n}", formatLocalizedCount(count, locale));
}

export function formatEvidenceCounts(
  sourceCount: number,
  referenceCount: number,
  template: string,
  sourcesTemplate: string,
  referencesTemplate: string,
  locale: Locale,
): string {
  return template
    .replace("{sources}", formatSourcesCount(sourceCount, sourcesTemplate, locale))
    .replace(
      "{references}",
      formatSourcesCount(referenceCount, referencesTemplate, locale),
    );
}
