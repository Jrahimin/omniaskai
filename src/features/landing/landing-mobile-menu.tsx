"use client";

import Link from "next/link";
import { useRef } from "react";

import type { LandingCopy } from "./landing-language";
import { ArrowRightIcon, MenuIcon } from "./landing-icons";

type LandingMobileMenuProps = {
  nav: LandingCopy["nav"];
};

export function LandingMobileMenu({ nav }: LandingMobileMenuProps) {
  const menuRef = useRef<HTMLDetailsElement>(null);
  const closeMenu = () => {
    if (menuRef.current) menuRef.current.open = false;
  };

  return (
    <details ref={menuRef} className="relative min-[980px]:hidden">
      <summary className="border-border text-foreground flex size-9 cursor-pointer list-none items-center justify-center rounded-full border bg-white/80 [&::-webkit-details-marker]:hidden">
        <span className="sr-only">{nav.menu}</span>
        <MenuIcon className="size-4" />
      </summary>
      <div className="border-border absolute top-[calc(100%+0.5rem)] right-0 z-50 w-64 rounded-2xl border bg-white p-3 shadow-[0_16px_40px_rgba(22,28,48,0.12)]">
        <div className="flex flex-col gap-1 text-sm">
          <a href="#topics" onClick={closeMenu} className="hover:bg-surface-muted rounded-lg px-3 py-2">
            {nav.topics}
          </a>
          <a href="#how-it-works" onClick={closeMenu} className="hover:bg-surface-muted rounded-lg px-3 py-2">
            {nav.howItWorks}
          </a>
          <a href="#coverage" onClick={closeMenu} className="hover:bg-surface-muted rounded-lg px-3 py-2">
            {nav.sources}
          </a>
        </div>
        <div className="border-border mt-2 border-t pt-2 min-[720px]:hidden">
          <Link href="/topics/income-tax" onClick={closeMenu} className="bg-brand text-surface flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold">
            {nav.tryIncomeTax}
            <ArrowRightIcon className="size-3.5" />
          </Link>
        </div>
      </div>
    </details>
  );
}
