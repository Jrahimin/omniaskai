import type { LandingCopy } from "./landing-language";

type LandingHowItWorksProps = {
  copy: LandingCopy;
};

export function LandingHowItWorks({ copy }: LandingHowItWorksProps) {
  const { howItWorks } = copy;
  const { flow } = howItWorks;

  return (
    <section
      id="how-it-works"
      className="relative pt-10 pb-12 min-[1024px]:pt-12 min-[1024px]:pb-16"
    >
      <div className="landing-wide">
        <div className="grid items-center gap-9 min-[1024px]:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] min-[1024px]:gap-16">
          <div>
            <p className="text-brand text-[0.75rem] font-semibold tracking-[0.08em] uppercase">
              {howItWorks.kicker}
            </p>
            <h2 className="text-foreground mt-3 max-w-[28rem] text-[1.7rem] leading-tight font-bold tracking-tight min-[1280px]:text-[2rem]">
              {howItWorks.heading}
            </h2>
            <p className="text-muted mt-4 max-w-[32rem] text-base leading-relaxed">
              {howItWorks.intro}
            </p>
            <ol className="mt-8 flex flex-col gap-0 border-l border-[#d9deed] ml-4">
              {howItWorks.steps.map((step, index) => (
                <li key={step.title} className="relative flex gap-4 pb-6 last:pb-0">
                  <span className="text-brand -ml-4 flex size-8 shrink-0 items-center justify-center rounded-full border border-[#cfd2fc] bg-[#f5f4ff] text-[0.7rem] font-bold shadow-[0_0_0_5px_#fafaff]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="pt-0.5">
                    <h3 className="text-foreground text-base font-semibold">
                      {step.title}
                    </h3>
                    <p className="text-muted mt-1 text-[0.95rem] leading-relaxed">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="landing-answer-stage rounded-[1.75rem] p-3 min-[640px]:p-5">
            <div className="rounded-[1.35rem] border border-white/80 bg-white/90 p-5 shadow-[0_18px_40px_rgba(28,40,76,0.10)] min-[640px]:p-6">
              <div className="rounded-2xl bg-[#f1f1ff] px-4 py-3">
                <p className="text-[0.68rem] font-semibold tracking-[0.1em] text-[#585abd] uppercase">
                  {flow.questionLabel}
                </p>
                <p className="text-foreground mt-1.5 text-[1.05rem] leading-snug font-semibold">
                  {flow.question}
                </p>
              </div>
              <div className="px-1 pt-5">
                <p className="text-[0.68rem] font-semibold tracking-[0.1em] text-[#5c6578] uppercase">
                  {flow.answerLabel}
                </p>
                <p className="text-foreground mt-1.5 text-[0.98rem] leading-relaxed">
                  {flow.answer}
                </p>
              </div>
              <div className="mt-5 rounded-2xl border border-[#d5eadf] bg-[#f2faf6] px-4 py-3">
                <p className="text-[0.68rem] font-semibold tracking-[0.1em] text-[#1f6b56] uppercase">
                  {flow.passageLabel}
                </p>
                <p className="mt-1.5 text-[0.93rem] leading-relaxed text-[#395c4e]">
                  {flow.passage}
                </p>
              </div>
              <p className="mt-5 inline-flex max-w-full flex-wrap gap-x-1 rounded-full border border-[#e2e5f2] bg-white px-4 py-2.5 text-[0.9rem] leading-relaxed text-[#1c2230] shadow-sm">
                <span className="text-[#5c6578]">{flow.followLabel}: </span>
                {flow.follow}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
