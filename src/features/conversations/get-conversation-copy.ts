import type { Locale } from "@/lib/locale/locale";

import {
  conversationLanguage,
  type ConversationCopy,
} from "./conversation-language";

export function getConversationCopy(locale: Locale): ConversationCopy {
  return conversationLanguage[locale];
}
