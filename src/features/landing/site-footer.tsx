import type { LandingCopy } from "./landing-language";

type SiteFooterProps = {
  footer: LandingCopy["footer"];
};

export function SiteFooter({ footer }: SiteFooterProps) {
  return (
    <footer className="pt-5 pb-8 min-[1024px]:pt-6 min-[1024px]:pb-10">
      <div className="landing-wide text-muted flex flex-col items-center gap-1.5 text-center text-sm">
        <p>
          <span className="text-foreground font-medium">OmniAskAI</span>
          <span className="mx-2 text-[#c5c9d6]">·</span>
          {footer.tagline}
        </p>
        <p className="mt-2 text-[0.75rem] tracking-wide text-[#8a90a0]">
          {footer.copyright}{" "}
          <a
            href="https://junayedrahimin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#6b7285] cursor-pointer underline-offset-3 transition-colors duration-150 hover:text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {footer.authorName}
            <span aria-hidden="true"> ↗</span>
            <span className="sr-only"> ({footer.opensInNewTab})</span>
          </a>
        </p>
      </div>
    </footer>
  );
}
