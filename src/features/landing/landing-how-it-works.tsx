import type { LandingCopy } from "./landing-language";
import {
  ChatIcon,
  CheckIcon,
  ChevronDownIcon,
  GlobeIcon,
  SourcesIcon,
  SparkIcon,
  StackIcon,
} from "./landing-icons";

type LandingHowItWorksProps = {
  copy: LandingCopy;
};

const stepIcons = [StackIcon, ChatIcon, CheckIcon] as const;
const stepWells = [
  "bg-[#eceaff] text-brand",
  "bg-[#e7f2ff] text-[#3a78d4]",
  "bg-[#e7f6ee] text-[#2a8a5e]",
] as const;
const stepSurfaces = [
  "bg-[#f6f5ff]",
  "bg-[#f3f8ff]",
  "bg-[#f2faf6]",
] as const;

export function LandingHowItWorks({ copy }: LandingHowItWorksProps) {
  const { howItWorks } = copy;

  return (
    <section
      id="how-it-works"
      className="relative scroll-mt-20 py-8 min-[1024px]:py-10"
    >
      <div className="landing-wide">
        <div className="rounded-[1.85rem] bg-white/80 px-5 py-7 shadow-[0_24px_56px_rgba(42,48,92,0.09)] min-[1024px]:px-9 min-[1024px]:py-8">
          <div className="grid items-start gap-7 min-[1024px]:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] min-[1024px]:gap-12">
            <div>
              <p className="bg-brand-soft text-brand inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.7rem] font-semibold tracking-wide">
                <SparkIcon className="size-3.5" />
                {howItWorks.kicker}
              </p>
              <h2 className="text-foreground mt-3 text-[1.5rem] leading-tight font-bold tracking-tight min-[1024px]:text-[1.75rem]">
                {howItWorks.heading}
              </h2>
              <p className="text-muted mt-3 max-w-[34rem] text-[0.92rem] leading-relaxed">
                {howItWorks.intro}
              </p>
            </div>

            <div>
              <p className="text-brand mb-2.5 text-[0.68rem] font-semibold tracking-[0.14em] uppercase">
                {howItWorks.contrast.storyLabel}
              </p>
              <div className="grid gap-2.5">
                <div className="rounded-[1.15rem] bg-[#eef0f5]/90 px-4 py-3.5">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/90 text-[#6b7288]">
                      <GlobeIcon className="size-4" />
                    </span>
                    <div>
                      <p className="text-muted text-[0.72rem] font-semibold tracking-wide">
                        {howItWorks.contrast.elsewhereLabel}
                      </p>
                      <p className="text-foreground/70 mt-0.5 text-[0.82rem] leading-snug">
                        {howItWorks.contrast.elsewhereBody}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="flex items-center justify-center gap-2 py-0.5">
                  <span className="bg-brand-soft text-brand flex size-7 items-center justify-center rounded-full">
                    <ChevronDownIcon className="size-3.5" />
                  </span>
                  <span className="text-brand text-[0.65rem] font-semibold tracking-[0.14em] uppercase">
                    {howItWorks.contrast.instead}
                  </span>
                </p>

                <div className="rounded-[1.15rem] bg-white px-4 py-3.5 shadow-[0_16px_36px_rgba(84,87,238,0.14)]">
                  <div className="flex items-start gap-3">
                    <span className="bg-brand-soft text-brand mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl">
                      <SourcesIcon className="size-4" />
                    </span>
                    <div>
                      <p className="text-brand text-[0.72rem] font-semibold tracking-wide">
                        {howItWorks.contrast.hereLabel}
                      </p>
                      <p className="text-foreground mt-0.5 text-[0.82rem] leading-snug">
                        {howItWorks.contrast.hereBody}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="text-foreground mt-7 text-[0.8rem] font-semibold tracking-wide">
            {howItWorks.stepsHeading}
          </p>

          <ol className="mt-3 grid grid-cols-1 gap-3 min-[1024px]:grid-cols-3 min-[1024px]:gap-4">
            {howItWorks.steps.map((step, index) => {
              const Icon = stepIcons[index];

              return (
                <li
                  key={step.title}
                  className={`relative rounded-[1.2rem] px-4 py-4 ${stepSurfaces[index]}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={`flex size-9 items-center justify-center rounded-xl ${stepWells[index]}`}
                    >
                      <Icon className="size-4" />
                    </span>
                    <span className="text-brand/50 text-[0.72rem] font-semibold tracking-[0.12em]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="text-foreground mt-3 text-[0.98rem] font-semibold tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-muted mt-1 text-[0.82rem] leading-snug">
                    {step.body}
                  </p>
                  <p className="text-foreground/80 mt-2.5 text-[0.8rem] leading-snug font-medium">
                    {step.example}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
