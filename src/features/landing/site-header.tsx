import Image from "next/image";
import Link from "next/link";

import { LanguageSwitch } from "@/lib/locale/language-switch";
import type { Locale } from "@/lib/locale/locale";

import type { LandingCopy } from "./landing-language";
import { ArrowRightIcon } from "./landing-icons";
import { LandingMobileMenu } from "./landing-mobile-menu";

type SiteHeaderProps = {
  locale: Locale;
  copy: LandingCopy;
};

export function SiteHeader({ locale, copy }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-[#e7e9f2]/80 bg-[#fcfcff]/80 backdrop-blur-md">
      <div className="landing-wide flex h-[4.25rem] items-center justify-between gap-3">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Image
            src="/brand/omniaskai-logo.png"
            alt=""
            width={36}
            height={36}
            priority
            className="size-9"
          />
          <span className="text-foreground text-[0.95rem] font-semibold tracking-tight">
            OmniAskAI
          </span>
        </Link>

        <nav
          aria-label={copy.nav.primary}
          className="text-muted hidden items-center gap-4 text-[0.86rem] min-[980px]:flex"
        >
          <a href="#topics" className="hover:text-foreground">
            {copy.nav.topics}
          </a>
          <a href="#how-it-works" className="hover:text-foreground">
            {copy.nav.howItWorks}
          </a>
          <a href="#coverage" className="hover:text-foreground">
            {copy.nav.sources}
          </a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitch
            locale={locale}
            ariaLabel={copy.languageSwitch.ariaLabel}
            pendingLabel={copy.languageSwitch.pending}
          />
          <Link
            href="/topics/income-tax"
            className="bg-brand text-surface hidden items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold min-[720px]:inline-flex focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {copy.nav.tryIncomeTax}
            <ArrowRightIcon className="size-3.5" />
          </Link>
          <LandingMobileMenu nav={copy.nav} />
        </div>
      </div>
    </header>
  );
}
