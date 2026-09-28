"use client";

import { useRef } from "react";

import type { LandingCopy } from "./landing-language";
import { ArrowRightIcon } from "./landing-icons";

type Props = {
  hero: LandingCopy["hero"];
};

export function LandingAnswerGuideTrigger({ hero }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { guide } = hero;

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="text-foreground inline-flex items-center gap-2 rounded-full border border-[#d9dde8] bg-white px-4 py-2.5 text-sm font-semibold transition-colors hover:border-[#a9b2ed] hover:bg-[#f7f8ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        {hero.seeExample}
      </button>
      <dialog
        ref={dialogRef}
        className="landing-guide-dialog"
        aria-labelledby="landing-guide-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) dialogRef.current?.close();
        }}
      >
        <div className="landing-guide-content">
          <div className="landing-guide-heading">
            <button
              type="button"
              className="landing-guide-close"
              aria-label={guide.close}
              onClick={() => dialogRef.current?.close()}
            >
              <span aria-hidden="true">×</span>
            </button>
            <div className="landing-guide-orbit" aria-hidden="true">
              <span className="landing-guide-orbit-document" />
              <span className="landing-guide-orbit-search">✦</span>
            </div>
            <p className="landing-guide-eyebrow">{guide.eyebrow}</p>
            <h2 id="landing-guide-title">{guide.title}</h2>
            <p className="landing-guide-intro">{guide.intro}</p>
          </div>
          <ol className="landing-guide-steps">
            {guide.steps.map((step, index) => (
              <li key={step.title}>
                <span className="landing-guide-number">0{index + 1}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="landing-guide-foot">
            <p>{guide.note}</p>
            <a href="#topics" onClick={() => dialogRef.current?.close()}>
              {hero.exploreTopics}
              <ArrowRightIcon className="size-4" />
            </a>
          </div>
        </div>
      </dialog>
    </>
  );
}
