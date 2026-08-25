import type { Locale } from "@/lib/locale/locale";

import { landingLanguage, type LandingCopy } from "./landing-language";

export function getLandingCopy(locale: Locale): LandingCopy {
  return landingLanguage[locale];
}
