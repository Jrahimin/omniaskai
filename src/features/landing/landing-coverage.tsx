import type { LandingCopy } from "./landing-language";

type LandingCoverageProps = {
  copy: LandingCopy;
};

export function LandingCoverage({ copy }: LandingCoverageProps) {
  const { coverage } = copy;

  return (
    <section id="coverage" className="relative pt-7 pb-3 min-[1024px]:pt-10 min-[1024px]:pb-5">
      <div className="landing-wide">
        <div className="rounded-[1.75rem] border border-[#e4e8f1] bg-[#f7f9fc] p-5 shadow-[0_16px_44px_rgba(23,34,70,0.045)] min-[640px]:p-7 min-[1024px]:p-9">
          <div className="max-w-[44rem]">
            <h2 className="text-foreground text-[1.6rem] leading-tight font-bold tracking-tight min-[1280px]:text-[1.85rem]">
              {coverage.heading}
            </h2>
            <p className="text-muted mt-3 text-base leading-relaxed">{coverage.intro}</p>
          </div>
          <div className="mt-8 grid gap-3 min-[900px]:grid-cols-3">
            {coverage.points.map((point, index) => (
              <article key={point.title} className="rounded-[1.25rem] border border-[#e5e9f1] bg-white p-5 shadow-[0_7px_20px_rgba(23,34,70,0.035)] min-[1280px]:p-6">
                <span className="text-brand text-[0.7rem] font-bold tracking-[0.12em]">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="text-foreground mt-4 text-base font-semibold">{point.title}</h3>
                <p className="text-muted mt-2 text-[0.92rem] leading-relaxed">{point.body}</p>
              </article>
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-3 rounded-[1.25rem] border border-[#d8e9e2] bg-[#ecf6f1] p-5 min-[900px]:flex-row min-[900px]:items-start min-[900px]:gap-8 min-[1280px]:p-6">
            <h3 className="w-full shrink-0 text-base font-semibold text-[#1f5a48] min-[900px]:w-48">{coverage.storageTitle}</h3>
            <p className="text-[0.92rem] leading-relaxed text-[#3c5d51]">{coverage.storageBody}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
