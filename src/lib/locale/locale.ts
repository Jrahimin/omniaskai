export const locales = ["en", "bn"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeCookieName = "omniaskai_locale";

export const localeShortLabels: Record<Locale, string> = {
  en: "EN",
  bn: "বাং",
};

export const localeChrome: Record<
  Locale,
  { skipToContent: string }
> = {
  en: { skipToContent: "Skip to content" },
  bn: { skipToContent: "মূল বিষয়ে যান" },
};

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}
