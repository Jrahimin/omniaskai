import Image from "next/image";

import type { LandingCopy } from "./landing-language";
import { ArrowRightIcon } from "./landing-icons";

type LandingFinalCtaProps = {
  copy: LandingCopy;
};

export function LandingFinalCta({ copy }: LandingFinalCtaProps) {
  const { finalCta } = copy;

  return (
    <section className="relative pt-6 pb-10 min-[1024px]:pt-7 min-[1024px]:pb-14">
      <div className="landing-wide">
        <div className="landing-final-panel relative isolate overflow-hidden rounded-[1.75rem] px-6 pt-9 pb-4 shadow-[0_18px_42px_rgba(57,74,125,0.11)] min-[640px]:px-9 min-[900px]:min-h-[19rem] min-[900px]:py-8 min-[1024px]:px-12">
          <div className="relative z-10 grid items-center gap-1 min-[900px]:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] min-[900px]:gap-5">
            <div className="max-w-[36rem]">
              <h2 className="text-[1.6rem] leading-tight font-bold tracking-tight text-[#20294b] min-[1280px]:text-[2rem]">
                {finalCta.heading}{" "}
                <span className="text-[#4c52d9]">{finalCta.headingEmphasis}</span>
              </h2>
              <p className="mt-3 max-w-[32rem] text-base leading-relaxed text-[#52617a]">
                {finalCta.body}
              </p>
              <a
                href="#topics"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#4c52d9] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(76,82,217,0.2)] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4c52d9] motion-reduce:transition-none"
              >
                {finalCta.action}
                <ArrowRightIcon className="size-4" />
              </a>
            </div>
            <div className="relative mx-auto mt-2 h-36 w-full max-w-[20rem] min-[900px]:mt-0 min-[900px]:h-[16rem] min-[900px]:max-w-[24rem] min-[1280px]:h-[18rem]">
              <Image
                src="/landing/final-cta-source-glass.png"
                alt=""
                fill
                sizes="(min-width: 1280px) 430px, (min-width: 900px) 360px, 320px"
                className="object-contain drop-shadow-[0_18px_28px_rgba(5,10,38,0.18)]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
