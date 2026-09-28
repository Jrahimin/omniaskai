import Image from "next/image";
import Link from "next/link";

import type { TopicPresentation } from "@/features/topics/topic-presentation";

import type { TopicCardCopy } from "./landing-language";
import { ArrowRightIcon } from "./landing-icons";

type TopicKnowledgeCardProps = {
  slug: string;
  copy: TopicCardCopy;
  presentation: TopicPresentation;
  priority?: boolean;
  interactive?: boolean;
};

export function TopicKnowledgeCard({
  slug,
  copy,
  presentation,
  priority = false,
  interactive = true,
}: TopicKnowledgeCardProps) {
  const className =
    "topic-world-card group relative isolate block h-full min-h-[24rem] overflow-hidden rounded-[1.55rem] min-[760px]:min-h-[20rem] min-[1024px]:min-h-[16.75rem] min-[1280px]:min-h-[18rem]";

  const body = (
    <>
      {presentation.artworkSrc ? (
        <Image
          src={presentation.artworkSrc}
          alt=""
          fill
          priority={priority}
          sizes="(min-width: 1280px) 640px, (min-width: 760px) 48vw, 100vw"
          className="topic-world-card-image object-cover"
          style={{ objectPosition: presentation.objectPosition }}
        />
      ) : (
        <div
          aria-hidden="true"
          className="topic-world-card-fallback absolute inset-0"
        />
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-black/25"
      />

      <div className="relative z-10 flex min-h-[24rem] flex-col p-4 text-white min-[760px]:min-h-[20rem] min-[1024px]:min-h-[16.75rem] min-[1024px]:p-3.5 min-[1280px]:min-h-[18rem] min-[1280px]:p-4">
        <div className="flex items-start justify-between gap-3">
          {copy.badge ? (
            <p className="topic-world-badge inline-flex w-fit shrink-0 rounded-full px-3 py-1.5 text-[0.68rem] font-semibold tracking-[0.08em] uppercase">
              {copy.badge}
            </p>
          ) : null}
          {copy.preview ? (
            <div className="topic-world-question-glass ml-auto hidden max-w-[65%] rounded-xl px-3 py-2 min-[1024px]:block">
              <p className="text-[0.61rem] font-bold tracking-[0.1em] text-[#3f5370] uppercase">{copy.exampleLabel}</p>
              <p className="mt-0.5 line-clamp-2 text-[0.75rem] leading-tight font-semibold text-[#1d2a3c]">“{copy.preview.question}”</p>
            </div>
          ) : null}
        </div>
        <div className="topic-world-glass mt-auto rounded-[1.2rem] p-4 min-[1024px]:p-3.5 min-[1280px]:p-4">
          <h3 className="text-[1.5rem] leading-tight font-bold tracking-tight min-[1024px]:text-[1.25rem] min-[1280px]:text-[1.4rem]">
            {copy.title}
          </h3>
          <p className="mt-1 line-clamp-2 max-w-[30rem] text-[0.87rem] leading-snug text-white/90 min-[1024px]:line-clamp-1 min-[1024px]:text-[0.77rem]">
            {copy.subtitle}
          </p>
          <div className="mt-3 border-t border-white/20 pt-3 min-[1024px]:mt-2 min-[1024px]:border-0 min-[1024px]:pt-0">
            {copy.preview ? (
              <div className="min-[1024px]:hidden">
                <p className="text-[0.63rem] font-semibold tracking-[0.11em] text-white/65 uppercase">{copy.exampleLabel}</p>
                <p className="mt-1 line-clamp-2 max-w-[22rem] text-[0.85rem] leading-snug font-medium text-white/95">
                  “{copy.preview.question}”
                </p>
              </div>
            ) : null}
            <span className="mt-3 flex items-center justify-between gap-3 text-[0.82rem] font-semibold text-white min-[1024px]:mt-0 min-[1024px]:text-[0.75rem]">
              {copy.explore}
              <span className="topic-enter-arrow flex size-8 shrink-0 items-center justify-center rounded-full border border-white/35 bg-white/15 min-[1024px]:size-6" aria-hidden="true">
                <ArrowRightIcon className="size-4" />
              </span>
            </span>
          </div>
        </div>
      </div>
    </>
  );

  if (!interactive) {
    return (
      <div className={className} data-mood={presentation.mood}>
        {body}
      </div>
    );
  }

  return (
    <Link
      href={`/topics/${slug}`}
      aria-label={copy.explore}
      className={className}
      data-mood={presentation.mood}
    >
      {body}
    </Link>
  );
}
