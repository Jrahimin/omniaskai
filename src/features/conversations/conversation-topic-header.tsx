import Image from "next/image";
import Link from "next/link";

import type { TopicPresentation } from "@/features/topics/topic-presentation";
import { LanguageSwitch } from "@/lib/locale/language-switch";
import type { Locale } from "@/lib/locale/locale";

import type {
  ConversationCopy,
  TopicIdentityCopy,
  WorkspaceGuide,
} from "./conversation-language";
import {
  CalendarIcon,
  InfoCircleIcon,
  MenuIcon,
  PlusIcon,
  SourcesMarkIcon,
} from "./conversation-icons";

type ConversationTopicHeaderProps = {
  locale: Locale;
  copy: ConversationCopy;
  identity: TopicIdentityCopy;
  presentation: TopicPresentation;
  guide: WorkspaceGuide;
  onOpenHistory: () => void;
  onNewConversation: () => void;
  onOpenGuide: () => void;
  onOpenSources?: () => void;
  sourcesCountLabel?: string;
};

export function ConversationTopicHeader({
  locale,
  copy,
  identity,
  presentation,
  guide,
  onOpenHistory,
  onNewConversation,
  onOpenGuide,
  onOpenSources,
  sourcesCountLabel,
}: ConversationTopicHeaderProps) {
  return (
    <header className="workspace-header workspace-topic-band">
      <div className="workspace-topic-band-glow" aria-hidden="true" />
      <div className="workspace-topic-band-art">
        <Image
          src={presentation.artworkSrc}
          alt=""
          fill
          sizes="320px"
          className="object-cover"
          style={{ objectPosition: presentation.objectPosition }}
        />
      </div>

      <div className="relative z-1 flex items-start justify-between gap-3 px-4 py-3 min-[1024px]:px-5 min-[1280px]:px-6">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenHistory}
              className="border-border text-foreground inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full border min-[900px]:hidden"
              aria-label={copy.openHistory}
            >
              <MenuIcon className="size-4" />
            </button>
            <nav aria-label="Breadcrumb" className="text-muted min-w-0 text-[0.7rem]">
              <ol className="flex items-center gap-1.5">
                <li>
                  <Link href="/" className="hover:text-foreground">
                    {copy.topicsCrumb}
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li className="text-foreground truncate">{identity.title}</li>
              </ol>
            </nav>
          </div>

          <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <h1 className="workspace-topic-title text-[1.28rem] leading-tight font-bold tracking-tight min-[1280px]:text-[1.42rem]">
              {identity.title}
            </h1>
            {identity.badge ? (
              <span className="inline-flex items-center rounded-full bg-[#f4ead0] px-2 py-0.5 text-[0.62rem] font-semibold text-[#8a6420]">
                {identity.badge}
              </span>
            ) : null}
            <span className="text-muted text-[0.78rem]">{identity.subtitle}</span>
          </div>

          <ul className="text-muted mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[0.7rem]">
            <li className="inline-flex items-center gap-1">
              <SourcesMarkIcon className="size-3.5" />
              {identity.sourceStat}
            </li>
            <li className="inline-flex items-center gap-1">
              <CalendarIcon className="size-3.5" />
              {identity.updatedStat}
            </li>
          </ul>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <p className="text-muted max-w-[36rem] text-[0.7rem] leading-snug">
              {guide.shortHint}
            </p>
            <button
              type="button"
              onClick={onOpenGuide}
              className="text-foreground inline-flex cursor-pointer items-center gap-1 rounded-full bg-white/70 px-2 py-0.5 text-[0.7rem] font-medium"
              aria-haspopup="dialog"
            >
              <InfoCircleIcon className="size-3.5" />
              {guide.openLabel}
            </button>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <LanguageSwitch locale={locale} ariaLabel={copy.languageSwitchAria} />
          <div className="flex items-center gap-2 min-[900px]:hidden">
            <button
              type="button"
              onClick={onNewConversation}
              className="border-border text-foreground inline-flex size-8 cursor-pointer items-center justify-center rounded-full border"
              aria-label={copy.newConversation}
            >
              <PlusIcon className="size-3.5" />
            </button>
            {onOpenSources ? (
              <button
                type="button"
                onClick={onOpenSources}
                className="border-border text-foreground inline-flex cursor-pointer items-center gap-1 rounded-full border bg-white/80 px-2.5 py-1.5 text-[0.75rem] font-medium"
              >
                <SourcesMarkIcon className="size-3.5" />
                {sourcesCountLabel ?? copy.sources}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
