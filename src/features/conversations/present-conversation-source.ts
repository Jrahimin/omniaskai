const MOJIBAKE = /[†‡÷©®§¶µ¤¦±¼½¾]/g;
const CITE_BLOCK = /cite[\s\S]*?/g;
const INTERNAL_TOKEN = /\[wordlim:\s*\d+\]|turn\d+search\d+||/gi;

export type PresentedSourceText = {
  title: string;
  excerpt?: string;
  titleUnclear: boolean;
  excerptUnclear: boolean;
};

export function presentConversationSource(input: {
  title?: string;
  excerpt?: string;
  href?: string;
  fallbackTitle: string;
}): PresentedSourceText {
  const rawTitle = input.title?.trim() ?? "";
  const titleUnclear = !isReadableTitle(rawTitle);
  const title = titleUnclear
    ? hostnameLabel(input.href) ?? input.fallbackTitle
    : rawTitle.replace(/^Microsoft Word\s*[-–—:]\s*/i, "");

  const cleaned = cleanExcerpt(input.excerpt);
  const excerptUnclear = Boolean(input.excerpt?.trim()) && !cleaned;

  return {
    title,
    excerpt: cleaned,
    titleUnclear,
    excerptUnclear,
  };
}

function isReadableTitle(value: string): boolean {
  if (!value || /^https?:\/\//i.test(value)) {
    return false;
  }

  const hasInternalToken = INTERNAL_TOKEN.test(value);
  INTERNAL_TOKEN.lastIndex = 0;

  if (hasInternalToken) {
    return false;
  }

  if ((value.match(MOJIBAKE) ?? []).length >= 2) {
    return false;
  }

  return (value.match(/\p{L}{2,}/gu) ?? []).length > 0;
}

function cleanExcerpt(value: string | undefined): string | undefined {
  if (!value?.trim()) {
    return undefined;
  }

  const text = stripCrawlMeta(
    value
      .replace(CITE_BLOCK, " ")
      .replace(INTERNAL_TOKEN, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );

  if (!text || (text.match(MOJIBAKE) ?? []).length >= 3) {
    return undefined;
  }

  return completePassage(text);
}

function stripCrawlMeta(value: string): string {
  return value
    .replace(
      /^(?:published|last updated|posted|retrieved|updated)\s*:\s*\d+(?:\.\d+)?\s*(?:years?|months?|weeks?|days?|hours?)\s+ago\.?\s*/i,
      "",
    )
    .replace(
      /^\d+(?:\.\d+)?\s*(?:years?|months?|weeks?|days?|hours?)\s+ago\.?\s*/i,
      "",
    )
    .replace(/\s+/g, " ")
    .trim();
}

function completePassage(value: string): string | undefined {
  const sentenceEnd = Math.max(
    value.lastIndexOf("."),
    value.lastIndexOf("!"),
    value.lastIndexOf("?"),
    value.lastIndexOf("।"),
  );

  if (sentenceEnd >= 12) {
    return value.slice(0, sentenceEnd + 1).trim();
  }

  if (/[.!?।…"']$/.test(value)) {
    return value;
  }

  return undefined;
}

function hostnameLabel(href: string | undefined): string | undefined {
  if (!href) {
    return undefined;
  }

  try {
    return new URL(href).hostname;
  } catch {
    return undefined;
  }
}
