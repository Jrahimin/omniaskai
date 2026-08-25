import Image from "next/image";

import type { LandingCopy } from "./landing-language";
import { ArrowRightIcon } from "./landing-icons";

type LandingFinalCtaProps = {
  copy: LandingCopy;
};

export function LandingFinalCta({ copy }: LandingFinalCtaProps) {
  const { finalCta } = copy;

  return (
    <section className="relative pt-6 pb-4 min-[1024px]:pt-8 min-[1024px]:pb-2">
      <div className="landing-wide">
        <div className="relative overflow-hidden rounded-[1.75rem] bg-[#eef1ff]/90 shadow-[0_24px_60px_rgba(42,48,92,0.12)] ring-1 ring-[#d5daf3]/80">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
          />
          <div className="relative min-h-[15.5rem] min-[1024px]:min-h-[17.5rem] min-[1280px]:min-h-[18.5rem]">
            <Image
              src="/landing/omniaskai-knowledge-portal-cta.png"
              alt=""
              fill
              sizes="(min-width: 1360px) 1360px, 100vw"
              className="object-cover object-left"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-linear-to-l from-[#f7f8ff] via-[#f7f8ff]/30 to-transparent max-[1023px]:from-[#f7f8ff]/86 max-[1023px]:via-[#f7f8ff]/50"
            />
            <div className="relative z-10 flex min-h-[15.5rem] items-center justify-end px-6 py-8 min-[1024px]:min-h-[17.5rem] min-[1024px]:px-12 min-[1280px]:min-h-[18.5rem] min-[1280px]:px-14">
              <div className="max-w-[23rem] rounded-2xl bg-white/58 p-5 ring-1 ring-white/70 backdrop-blur-md min-[1024px]:bg-transparent min-[1024px]:p-0 min-[1024px]:ring-0 min-[1024px]:backdrop-blur-none">
                <h2 className="text-foreground text-[1.45rem] leading-[1.15] font-bold tracking-tight min-[1024px]:text-[1.75rem]">
                  {finalCta.heading}{" "}
                  <span className="text-brand">{finalCta.headingEmphasis}</span>
                </h2>
                <p className="text-muted mt-2.5 max-w-[22rem] text-sm leading-relaxed">
                  {finalCta.body}
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <a
                    href="#topics"
                    className="bg-brand text-surface inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-[0_10px_24px_rgba(84,87,238,0.22)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    {finalCta.browseTopics}
                    <ArrowRightIcon className="size-4" />
                  </a>
                  <button
                    type="button"
                    disabled
                    aria-label={`${finalCta.createAccount}. ${copy.nav.unavailable}`}
                    className="border-border text-foreground cursor-not-allowed rounded-full border bg-white/88 px-4 py-2.5 text-sm font-semibold whitespace-nowrap opacity-80"
                  >
                    {finalCta.createAccount}
                  </button>
                </div>
                <p className="text-muted mt-3 text-xs">{finalCta.footnote}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
