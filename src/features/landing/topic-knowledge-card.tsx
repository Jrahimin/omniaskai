import Image from "next/image";
import Link from "next/link";

import type { TopicPresentation } from "@/features/topics/topic-presentation";

import type { TopicCardCopy } from "./landing-language";
import { ArrowRightIcon, SourcesIcon } from "./landing-icons";

type TopicKnowledgeCardProps = {
  slug: string;
  copy: TopicCardCopy;
  presentation: TopicPresentation;
  priority?: boolean;
};

export function TopicKnowledgeCard({
  slug,
  copy,
  presentation,
  priority = false,
}: TopicKnowledgeCardProps) {
  return (
    <Link
      href={`/topics/${slug}`}
      aria-label={copy.explore}
      className="topic-world-card group relative flex h-full min-h-[22rem] overflow-hidden rounded-[1.55rem] min-[1024px]:min-h-[20rem] min-[1280px]:min-h-[22rem]"
      data-mood={presentation.mood}
    >
      <Image
        src={presentation.artworkSrc}
        alt=""
        fill
        priority={priority}
        sizes="(min-width: 1360px) 640px, (min-width: 1024px) 48vw, 100vw"
        className="object-cover"
        style={{ objectPosition: presentation.objectPosition }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: `linear-gradient(105deg, ${presentation.scrimFrom} 0%, rgba(8,12,22,0.18) 46%, rgba(8,12,22,0.28) 100%)`,
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-36 bg-linear-to-t from-black/50 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[1.55rem] ring-1 ring-white/25"
      />

      <div className="relative z-10 grid h-full min-h-[22rem] flex-1 grid-cols-1 gap-4 p-5 min-[1024px]:min-h-[20rem] min-[1024px]:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] min-[1024px]:gap-6 min-[1024px]:p-6 min-[1280px]:min-h-[22rem] min-[1280px]:p-7">
        <div className="flex min-h-0 flex-col text-white">
          {copy.badge ? (
            <p className="mb-3 inline-flex w-fit rounded-full bg-white/18 px-2.5 py-0.5 text-[0.65rem] font-semibold tracking-wide shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
              {copy.badge}
            </p>
          ) : null}
          <h3 className="text-[1.7rem] leading-tight font-bold tracking-tight min-[1280px]:text-[1.85rem]">
            {copy.title}
          </h3>
          <p className="mt-2 max-w-[17rem] text-sm leading-relaxed text-white/88">
            {copy.subtitle}
          </p>
          <p className="mt-auto hidden w-fit items-center gap-1.5 rounded-full bg-black/18 px-2.5 py-1 text-xs font-medium text-white/92 ring-1 ring-white/15 min-[1024px]:mt-8 min-[1024px]:flex">
            <SourcesIcon className="size-3.5" />
            {copy.sourceCount}
          </p>
        </div>

        <div className="flex min-h-0 flex-col">
          <div className="rounded-[1.15rem] bg-white/58 p-3.5 shadow-[0_16px_36px_rgba(12,18,32,0.14),inset_0_1px_0_rgba(255,255,255,0.7)] ring-1 ring-white/70 backdrop-blur-md">
            <p className="text-muted text-[0.65rem] font-semibold tracking-wide uppercase">
              {copy.preview.youLabel}
            </p>
            <p className="text-foreground mt-1 text-[0.8rem] leading-snug">
              {copy.preview.question}
            </p>
            <p className="text-muted mt-3 text-[0.65rem] font-semibold tracking-wide uppercase">
              {copy.preview.assistantLabel}
            </p>
            <p className="text-foreground mt-1 line-clamp-4 text-[0.8rem] leading-snug">
              {copy.preview.answer}
            </p>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {copy.preview.sources.map((source) => (
                <li
                  key={source}
                  className="rounded-full bg-white/78 px-2 py-0.5 text-[0.65rem] font-medium text-[#3d4450] shadow-[0_1px_0_rgba(255,255,255,0.8)]"
                >
                  {source}
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-3 flex w-fit items-center gap-1.5 rounded-full bg-black/18 px-2.5 py-1 text-xs font-medium text-white/92 ring-1 ring-white/15 min-[1024px]:hidden">
            <SourcesIcon className="size-3.5" />
            {copy.sourceCount}
          </p>
          <p
            aria-hidden="true"
            className="mt-4 inline-flex w-full items-center justify-end gap-2 min-[1024px]:mt-auto"
          >
            <span className="text-base font-semibold tracking-tight text-white">
              {copy.explore}
            </span>
            <span className="topic-enter-arrow flex size-8 shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/12 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] backdrop-blur-sm">
              <ArrowRightIcon className="size-3.5" />
            </span>
          </p>
        </div>
      </div>
    </Link>
  );
}
