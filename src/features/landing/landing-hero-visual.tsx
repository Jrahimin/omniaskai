import Image from "next/image";

type LandingHeroVisualProps = {
  alt: string;
};

export function LandingHeroVisual({ alt }: LandingHeroVisualProps) {
  return (
    <div className="relative mx-auto w-full max-w-[34rem] min-[1024px]:max-w-none">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-[18%] -z-10 rounded-full bg-[#c9d2ff] opacity-30 blur-3xl"
      />
      <Image
        src="/landing/omniaskai-hero.png"
        alt={alt}
        width={1448}
        height={1086}
        priority
        sizes="(min-width: 1360px) 680px, (min-width: 1024px) 52vw, 100vw"
        className="relative h-auto w-full"
      />
    </div>
  );
}
