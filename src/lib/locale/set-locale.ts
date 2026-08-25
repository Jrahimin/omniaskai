"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { isLocale, localeCookieName } from "./locale";

export async function setLocaleFromForm(formData: FormData) {
  const value = formData.get("locale");

  if (typeof value !== "string" || !isLocale(value)) {
    return;
  }

  const cookieStore = await cookies();
  cookieStore.set(localeCookieName, value, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: true,
  });

  revalidatePath("/", "layout");
}
