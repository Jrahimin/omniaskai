import Image from "next/image";

import type { LandingCopy } from "./landing-language";
import { ArrowRightIcon } from "./landing-icons";

type SiteFooterProps = {
  copy: LandingCopy;
};

export function SiteFooter({ copy }: SiteFooterProps) {
  const { footer, nav } = copy;

  return (
    <footer className="landing-footer relative overflow-hidden border-t border-[#e0e4f1]">
      <div className="landing-wide relative z-10 pt-7 pb-5 min-[800px]:pt-8">
        <div className="grid gap-5 min-[800px]:grid-cols-[minmax(0,1fr)_auto] min-[800px]:items-center min-[800px]:gap-8">
          <div>
            <div className="flex items-center gap-2.5">
              <Image
                src="/brand/omniaskai-logo.png"
                alt=""
                width={36}
                height={36}
                className="size-9"
              />
              <p className="text-foreground text-[1.05rem] font-bold tracking-tight">OmniAskAI</p>
            </div>
            <p className="text-muted mt-1.5 max-w-[25rem] text-[0.86rem] leading-relaxed">
              {footer.tagline}
            </p>
          </div>

          <nav aria-label={nav.primary} className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.84rem]">
            {[
              { href: "#topics", label: nav.topics },
              { href: "#how-it-works", label: nav.howItWorks },
              { href: "#coverage", label: footer.sources },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-foreground group inline-flex min-h-10 items-center gap-1.5 rounded-full px-1 py-1 font-medium transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand min-[800px]:min-h-0"
              >
                {item.label}
                <ArrowRightIcon className="size-3 shrink-0 text-[#8b95b3] transition-transform group-hover:translate-x-0.5 group-hover:text-brand motion-reduce:transition-none" />
              </a>
            ))}
          </nav>
        </div>

        <div className="text-muted mt-5 flex flex-col gap-2 border-t border-[#dfe4ef] pt-3.5 text-[0.78rem] min-[800px]:flex-row min-[800px]:items-center min-[800px]:justify-between">
          <p>{footer.copyright} OmniAskAI</p>
          <p>
            {footer.operator}{" "}
            <a
              href="https://junayedrahimin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground font-medium underline-offset-3 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              {footer.authorName}
              <span aria-hidden="true"> ↗</span>
              <span className="sr-only"> ({footer.opensInNewTab})</span>
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
