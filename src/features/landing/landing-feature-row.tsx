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
  "bg-[#c9f2df] text-[#176c4d]",
  "bg-[#dedcff] text-[#5457bb]",
  "bg-[#d4e9ff] text-[#2e689f]",
  "bg-[#ffe5dc] text-[#a94f39]",
] as const;

export function LandingFeatureRow({ copy }: LandingFeatureRowProps) {
  return (
    <section className="relative py-6 min-[1024px]:py-8">
      <div className="landing-wide">
        <div className="landing-feature-panel grid gap-px overflow-hidden rounded-[1.65rem] border border-white/15 p-1.5 shadow-[0_22px_55px_rgba(20,29,60,0.16)] min-[640px]:grid-cols-2 min-[1100px]:grid-cols-4">
          {copy.features.items.map((item, index) => {
            const Icon = featureIcons[index];

            return (
              <div key={item.title} className="flex gap-3 rounded-[1.25rem] px-4 py-4 min-[1100px]:block min-[1100px]:py-5 min-[1280px]:px-5 min-[1280px]:py-6">
                <span
                  className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${featureWells[index]}`}
                >
                  <Icon className="size-5" />
                </span>
                <div>
                  <h3 className="text-[0.98rem] font-semibold tracking-tight text-white min-[1100px]:mt-4">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-[0.88rem] leading-relaxed text-white/70">
                    {item.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
