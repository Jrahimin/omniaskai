import type { LandingCopy } from "./landing-language";
import { LandingHeroVisual } from "./landing-hero-visual";
import {
  ArrowRightIcon,
  CheckIcon,
  PlayIcon,
  StarIcon,
} from "./landing-icons";

type LandingHeroProps = {
  copy: LandingCopy;
};

export function LandingHero({ copy }: LandingHeroProps) {
  const { hero } = copy;

  return (
    <section className="relative overflow-hidden pt-5 pb-4 min-[1024px]:pt-6 min-[1024px]:pb-5 min-[1280px]:pt-7 min-[1280px]:pb-6">
      <div className="landing-wide">
        <div className="grid items-center gap-5 min-[1024px]:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] min-[1024px]:gap-5 min-[1280px]:gap-8">
          <div className="max-w-[30rem]">
            <p className="bg-brand-soft text-brand inline-flex rounded-full px-3 py-1 text-[0.68rem] font-semibold tracking-wide">
              {hero.badge}
            </p>
            <h1 className="landing-hero-title text-foreground mt-3.5 text-[1.85rem] leading-[1.12] font-bold tracking-tight min-[1024px]:text-[2.2rem] min-[1280px]:text-[2.35rem]">
              {hero.headlineBefore}
              <br />
              <span className="text-brand">{hero.headlineHighlight}</span>
              <br />
              {hero.headlineAfter}
            </h1>
            <p className="text-muted mt-3 max-w-[27rem] text-[0.92rem] leading-relaxed">
              {hero.body}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <a
                href="#topics"
                className="bg-brand text-surface inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-[0_10px_24px_rgba(84,87,238,0.22)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                {hero.browseTopics}
                <ArrowRightIcon className="size-4" />
              </a>
              <a
                href="#how-it-works"
                className="border-border text-foreground inline-flex items-center gap-2 rounded-full border bg-white/75 px-4 py-2.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                <PlayIcon className="text-brand size-4" />
                {hero.seeHowItWorks}
              </a>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div aria-hidden="true" className="flex -space-x-2">
                {["#7c8cff", "#f0a36b", "#6ec8b0", "#c58cff"].map((color) => (
                  <span
                    key={color}
                    className="ring-background inline-block size-6 rounded-full ring-2"
                    style={{ background: color }}
                  />
                ))}
              </div>
              <div className="text-sm">
                <p className="text-foreground font-medium">{hero.trustedBy}</p>
                <p className="text-muted flex items-center gap-1 text-xs">
                  <span className="text-[#f5b942] flex" aria-hidden="true">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <StarIcon key={index} className="size-3" />
                    ))}
                  </span>
                  <span className="sr-only">{hero.ratingLabel}</span>
                  <span>{hero.rating}</span>
                </p>
              </div>
            </div>
          </div>
          <LandingHeroVisual alt={hero.heroImageAlt} />
        </div>

        <ul className="text-muted mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[0.82rem] min-[1024px]:mt-4">
          {hero.trust.map((item) => (
            <li key={item} className="flex items-center gap-1.5">
              <CheckIcon className="text-brand size-3.5 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
