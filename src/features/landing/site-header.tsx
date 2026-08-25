import Image from "next/image";
import Link from "next/link";

import { LanguageSwitch } from "@/lib/locale/language-switch";
import type { Locale } from "@/lib/locale/locale";

import type { LandingCopy } from "./landing-language";
import { MenuIcon } from "./landing-icons";

type SiteHeaderProps = {
  locale: Locale;
  copy: LandingCopy;
};

export function SiteHeader({ locale, copy }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#fcfcff]/55 backdrop-blur-md">
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
          className="text-muted hidden items-center gap-4 text-[0.9rem] min-[1024px]:flex min-[1280px]:gap-6"
        >
          <a href="#topics" className="hover:text-foreground">
            {copy.nav.topics}
          </a>
          <a href="#how-it-works" className="hover:text-foreground">
            {copy.nav.howItWorks}
          </a>
          <UnavailableNavLabel
            label={copy.nav.pricing}
            unavailable={copy.nav.unavailable}
          />
          <UnavailableNavLabel
            label={copy.nav.about}
            unavailable={copy.nav.unavailable}
          />
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitch
            locale={locale}
            ariaLabel={copy.languageSwitch.ariaLabel}
          />
          <div className="hidden items-center gap-2 min-[1024px]:flex">
            <UnavailableButton
              className="text-muted shrink-0 px-2 py-1.5 text-sm font-medium whitespace-nowrap"
              label={copy.nav.logIn}
              unavailable={copy.nav.unavailable}
            />
            <UnavailableButton
              className="bg-brand text-surface shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold whitespace-nowrap"
              label={copy.nav.createAccount}
              unavailable={copy.nav.unavailable}
            />
          </div>
          <details className="relative min-[1024px]:hidden">
            <summary className="border-border text-foreground flex size-9 cursor-pointer list-none items-center justify-center rounded-full border [&::-webkit-details-marker]:hidden">
              <span className="sr-only">{copy.nav.menu}</span>
              <MenuIcon className="size-4" />
            </summary>
            <div className="border-border bg-surface absolute top-[calc(100%+0.5rem)] right-0 z-50 w-56 rounded-2xl border p-3 shadow-lg">
              <div className="flex flex-col gap-1 text-sm">
                <a href="#topics" className="hover:bg-surface-muted rounded-lg px-3 py-2">
                  {copy.nav.topics}
                </a>
                <a
                  href="#how-it-works"
                  className="hover:bg-surface-muted rounded-lg px-3 py-2"
                >
                  {copy.nav.howItWorks}
                </a>
                <UnavailableNavLabel
                  label={copy.nav.pricing}
                  unavailable={copy.nav.unavailable}
                  className="px-3 py-2 text-left"
                />
                <UnavailableNavLabel
                  label={copy.nav.about}
                  unavailable={copy.nav.unavailable}
                  className="px-3 py-2 text-left"
                />
              </div>
              <div className="border-border mt-2 flex flex-col gap-2 border-t pt-2">
                <UnavailableButton
                  className="text-muted px-3 py-2 text-left text-sm font-medium"
                  label={copy.nav.logIn}
                  unavailable={copy.nav.unavailable}
                />
                <UnavailableButton
                  className="bg-brand text-surface rounded-full px-3 py-2 text-sm font-semibold"
                  label={copy.nav.createAccount}
                  unavailable={copy.nav.unavailable}
                />
              </div>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}

function UnavailableNavLabel({
  label,
  unavailable,
  className = "",
}: {
  label: string;
  unavailable: string;
  className?: string;
}) {
  return (
    <span
      className={`cursor-default ${className}`}
      title={unavailable}
    >
      {label}
    </span>
  );
}

function UnavailableButton({
  label,
  unavailable,
  className,
}: {
  label: string;
  unavailable: string;
  className: string;
}) {
  return (
    <button
      type="button"
      disabled
      aria-label={`${label}. ${unavailable}`}
      className={`cursor-not-allowed opacity-80 ${className}`}
    >
      {label}
    </button>
  );
}
