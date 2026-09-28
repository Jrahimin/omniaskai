import type { LandingCopy } from "./landing-language";
import { LandingHeroVisual } from "./landing-hero-visual";
import { ArrowRightIcon } from "./landing-icons";
import { LandingAnswerGuideTrigger } from "./landing-answer-guide-trigger";

type LandingHeroProps = {
  copy: LandingCopy;
};

export function LandingHero({ copy }: LandingHeroProps) {
  const { hero } = copy;

  return (
    <section className="relative pt-6 pb-4 min-[1024px]:pt-9 min-[1024px]:pb-7">
      <div className="landing-wide">
        <div className="grid items-center gap-6 min-[1024px]:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] min-[1024px]:gap-8 min-[1280px]:gap-10">
          <div className="max-w-[34rem]">
            <p className="text-brand text-[0.75rem] font-semibold tracking-[0.08em] uppercase">
              {hero.badge}
            </p>
            <h1 className="landing-hero-title text-foreground mt-3 text-[1.85rem] leading-[1.12] font-bold tracking-tight min-[1024px]:text-[2.2rem] min-[1280px]:text-[2.55rem]">
              {hero.headline}{" "}
              <span className="text-brand">{hero.headlineEmphasis}</span>
            </h1>
            <p className="text-muted mt-3 max-w-[32rem] text-[0.98rem] leading-relaxed min-[1024px]:mt-4 min-[1024px]:text-base">
              {hero.body}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <a
                href="#topics"
                className="bg-brand text-surface inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                {hero.exploreTopics}
                <ArrowRightIcon className="size-4" />
              </a>
              <LandingAnswerGuideTrigger hero={hero} />
            </div>
            <ul className="mt-5 hidden max-w-[32rem] flex-col gap-2 text-[0.92rem] leading-snug text-[#3d4454] min-[1280px]:flex">
              {hero.proof.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span
                    aria-hidden="true"
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-[#1f6b56]"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <LandingHeroVisual alt={hero.heroImageAlt} example={hero.example} />
        </div>
      </div>
    </section>
  );
}
