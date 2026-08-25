import type { Metadata } from "next";
import Link from "next/link";

import { getRequestLocale } from "@/lib/locale/get-request-locale";

export const metadata: Metadata = {
  title: { absolute: "OmniAskAI" },
};

export default async function NotFoundPage() {
  const locale = await getRequestLocale();
  const home =
    locale === "bn" ? "OmniAskAI-তে ফিরে যান" : "Back to OmniAskAI";
  const title = locale === "bn" ? "পাতাটি পাওয়া যায়নি" : "This page is not here";
  const body =
    locale === "bn"
      ? "এই বিষয় বা পাতা খুঁজে পাওয়া যায়নি। মূল পাতা থেকে একটি জ্ঞান-পরিসর বেছে নিন।"
      : "That topic or page could not be found. Choose a knowledge space from the home page.";

  return (
    <main id="main" tabIndex={-1} className="landing-shell py-20">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="text-muted mt-3 max-w-md text-base leading-relaxed">{body}</p>
      <p className="mt-8">
        <Link href="/" className="text-brand text-sm font-medium">
          {home}
        </Link>
      </p>
    </main>
  );
}
