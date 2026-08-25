import { cookies } from "next/headers";

import {
  defaultLocale,
  isLocale,
  localeCookieName,
  type Locale,
} from "./locale";

export async function getRequestLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(localeCookieName)?.value;

  if (value && isLocale(value)) {
    return value;
  }

  return defaultLocale;
}
