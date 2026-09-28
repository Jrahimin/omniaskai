import Image from "next/image";
import Link from "next/link";

import type { TopicPresentation } from "@/features/topics/topic-presentation";
import { LanguageSwitch } from "@/lib/locale/language-switch";
import type { Locale } from "@/lib/locale/locale";

import type {
  ConversationCopy,
  TopicIdentityCopy,
} from "./conversation-language";
import type { TopicOpening } from "./topic-opening";
import {
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
  opening: TopicOpening;
  showIntro: boolean;
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
  opening,
  showIntro,
  onOpenHistory,
  onNewConversation,
  onOpenGuide,
  onOpenSources,
  sourcesCountLabel,
}: ConversationTopicHeaderProps) {
  return (
    <header className="workspace-header workspace-topic-band" data-intro={showIntro ? "true" : "false"}>
      <div className="workspace-topic-band-glow" aria-hidden="true" />
      <div className="workspace-topic-band-art">
        {presentation.artworkSrc ? (
          <Image
            src={presentation.artworkSrc}
            alt=""
            fill
            sizes="(max-width: 640px) 240px, (max-width: 1200px) 380px, 480px"
            className="object-cover"
            style={{ objectPosition: presentation.objectPosition }}
          />
        ) : (
          <div aria-hidden="true" className="topic-world-card-fallback absolute inset-0" />
        )}
      </div>

      <div className="workspace-topic-band-inner">
        <div className="workspace-topic-band-top">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={onOpenHistory}
              className="workspace-topic-icon-button inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full min-[900px]:hidden"
              aria-label={copy.openHistory}
            >
              <MenuIcon className="size-4" />
            </button>
            <nav aria-label="Breadcrumb" className="workspace-topic-breadcrumb min-w-0 text-[0.7rem]">
              <ol className="flex items-center gap-1.5">
                <li>
                  <Link href="/" className="hover:underline">
                    {copy.topicsCrumb}
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li className="truncate">{identity.title}</li>
              </ol>
            </nav>
          </div>
          <div className="workspace-topic-utilities">
            <LanguageSwitch locale={locale} ariaLabel={copy.languageSwitchAria} />
            <button
              type="button"
              onClick={onNewConversation}
              className="workspace-topic-icon-button inline-flex size-8 cursor-pointer items-center justify-center rounded-full min-[900px]:hidden"
              aria-label={copy.newConversation}
            >
              <PlusIcon className="size-3.5" />
            </button>
          </div>
        </div>

        <div className="workspace-topic-band-copy">
          {showIntro ? (
            <>
              <h1 className="sr-only">{identity.title}</h1>
              <h2 className="workspace-topic-hook">{opening.title}</h2>
              <p className="workspace-topic-description">{opening.body}</p>
              <div className="workspace-topic-actions">
                <button
                  type="button"
                  onClick={onOpenGuide}
                  className="workspace-topic-about"
                  aria-haspopup="dialog"
                >
                  <span className="workspace-topic-about-icon"><InfoCircleIcon className="size-3.5" /></span>
                  {copy.aboutThisTopic}
                  <span className="workspace-topic-about-arrow" aria-hidden="true">↗</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="workspace-topic-compact-title">
                <h1>{identity.title}</h1>
                <span>{identity.subtitle}</span>
              </div>
              <div className="workspace-topic-compact-actions">
                <p>{identity.sourceDescription}</p>
                <button
                  type="button"
                  onClick={onOpenGuide}
                  className="workspace-topic-about"
                  aria-haspopup="dialog"
                >
                  <span className="workspace-topic-about-icon"><InfoCircleIcon className="size-3.5" /></span>
                  {copy.aboutThisTopic}
                  <span className="workspace-topic-about-arrow" aria-hidden="true">↗</span>
                </button>
              </div>
            </>
          )}
          {onOpenSources && sourcesCountLabel ? (
            <button
              type="button"
              onClick={onOpenSources}
              className="workspace-topic-sources-action inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.78rem] font-semibold min-[900px]:hidden"
            >
              <SourcesMarkIcon className="size-3.5" />
              {sourcesCountLabel}
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
