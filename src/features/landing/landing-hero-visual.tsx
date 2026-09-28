"use client";

import Image from "next/image";
import { useState } from "react";

import type { LandingCopy } from "./landing-language";

type LandingHeroVisualProps = {
  alt: string;
  example: LandingCopy["hero"]["example"];
};

export function LandingHeroVisual({ alt, example }: LandingHeroVisualProps) {
  const [open, setOpen] = useState(false);

  return (
    <div id="sourced-answer" className="relative">
      <div className="relative overflow-hidden rounded-[1.6rem] bg-[#f3f4fb] ring-1 ring-[#e4e7f2]">
        <Image
          src="/landing/omniaskai-hero.png"
          alt={alt}
          width={1448}
          height={1086}
          priority
          sizes="(min-width: 1280px) 640px, (min-width: 1024px) 52vw, 100vw"
          className={`${open ? "h-[20rem]" : "h-[15rem]"} w-full object-cover object-[center_22%] transition-[height] duration-300 motion-reduce:transition-none min-[1024px]:h-[20rem] min-[1280px]:h-[22rem]`}
        />
        <article className="hero-example-glass absolute bottom-3 left-3 z-10 max-h-[calc(100%-1.5rem)] w-[calc(100%-1.5rem)] max-w-[17rem] overflow-y-auto rounded-[1.1rem] p-3 shadow-[0_16px_36px_rgba(22,28,48,0.17)] min-[1024px]:bottom-4 min-[1024px]:left-4">
          <p className="text-brand text-[0.62rem] font-semibold tracking-[0.12em] uppercase">
            {example.label}
          </p>
          <p className="text-foreground mt-1 text-[0.85rem] leading-snug font-semibold tracking-tight">
            {example.question}
          </p>
          <p className="text-muted mt-1 text-[0.76rem] leading-snug">
            {example.answer}
          </p>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="hero-example-passage"
            onClick={() => setOpen((current) => !current)}
            className="mt-2 inline-flex cursor-pointer items-center rounded-lg bg-[#e2f3ed]/90 px-2 py-1 text-[0.69rem] font-semibold text-[#1f6b56] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {example.sourceLabel}
          </button>
          <div
            id="hero-example-passage"
            hidden={!open}
            className="mt-2 border-l-2 border-[#1f6b56] pl-2.5"
          >
            <p className="text-[0.63rem] font-semibold tracking-wide text-[#1f6b56] uppercase">
              {example.passageLabel}
            </p>
            <p className="text-muted mt-1 text-[0.74rem] leading-snug">
              {example.passage}
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}
