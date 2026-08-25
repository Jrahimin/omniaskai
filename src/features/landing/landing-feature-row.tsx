import type { LandingCopy } from "./landing-language";
import {
  GlobeIcon,
  LockIcon,
  SearchIcon,
  ShieldIcon,
} from "./landing-icons";

type LandingFeatureRowProps = {
  copy: LandingCopy;
};

const featureIcons = [ShieldIcon, SearchIcon, GlobeIcon, LockIcon] as const;
const featureWells = [
  "bg-[#e7f6ee] text-[#2a8a5e]",
  "bg-[#eceaff] text-[#5457ee]",
  "bg-[#e7f2ff] text-[#3a78d4]",
  "bg-[#fdece8] text-[#c85a46]",
] as const;

export function LandingFeatureRow({ copy }: LandingFeatureRowProps) {
  return (
    <section className="relative py-6 min-[1024px]:py-8">
      <div className="landing-wide grid grid-cols-1 gap-5 min-[640px]:grid-cols-2 min-[1024px]:grid-cols-4 min-[1024px]:gap-6">
        {copy.features.items.map((item, index) => {
          const Icon = featureIcons[index];

          return (
            <div key={item.title} className="flex gap-3">
              <span
                className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl ${featureWells[index]}`}
              >
                <Icon className="size-5" />
              </span>
              <div>
                <h3 className="text-foreground text-sm font-semibold tracking-tight">
                  {item.title}
                </h3>
                <p className="text-muted mt-0.5 text-[0.8rem] leading-relaxed">
                  {item.body}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
