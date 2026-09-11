import Image from "next/image";
import Link from "next/link";

import { adminCopy } from "./admin-copy";
import { AdminSignOutButton } from "./admin-sign-out-button";

type AdminShellProps = {
  email: string;
  children: React.ReactNode;
};

export function AdminShell({ email, children }: AdminShellProps) {
  return (
    <div className="landing-canvas min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-black/6 bg-[#fcfcff]/70 backdrop-blur-md">
        <div className="landing-wide flex min-h-[4.25rem] flex-wrap items-center justify-between gap-x-3 gap-y-2 py-2">
          <div className="flex min-w-0 flex-wrap items-center gap-x-6 gap-y-2">
            <Link href="/admin/topics" className="flex shrink-0 items-center gap-2.5">
              <Image
                src="/brand/omniaskai-logo.png"
                alt=""
                width={36}
                height={36}
                className="size-9"
              />
              <span className="text-foreground text-[0.95rem] font-semibold tracking-tight">
                OmniAskAI {adminCopy.title}
              </span>
            </Link>
            <nav className="text-muted flex items-center gap-3 text-[0.9rem] min-[720px]:gap-4">
              <Link href="/admin/topics" className="hover:text-foreground">
                {adminCopy.topics}
              </Link>
              <Link href="/admin/conversations" className="hover:text-foreground">
                {adminCopy.conversations}
              </Link>
            </nav>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <p className="text-muted hidden truncate text-sm min-[720px]:block">{email}</p>
            <AdminSignOutButton />
          </div>
        </div>
      </header>
      <div className="landing-wide py-8">{children}</div>
    </div>
  );
}
