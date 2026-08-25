import type { Metadata } from "next";

import { LandingPage } from "@/features/landing/landing-page";
import { getLandingCopy } from "@/features/landing/get-landing-copy";
import { getPublishedTopics } from "@/features/topics/get-published-topics";
import { getRequestLocale } from "@/lib/locale/get-request-locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const copy = getLandingCopy(locale);

  return {
    title: { absolute: copy.meta.title },
    description: copy.meta.description,
  };
}

export default async function HomePage() {
  const locale = await getRequestLocale();
  const topics = getPublishedTopics();

  return <LandingPage locale={locale} topics={topics} />;
}
