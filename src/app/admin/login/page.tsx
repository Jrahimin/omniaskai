import Image from "next/image";

import { AdminLoginForm } from "@/features/admin/admin-login-form";
import { adminCopy } from "@/features/admin/admin-copy";
import { getAdminSession } from "@/features/admin/require-admin-session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const session = await getAdminSession();

  if (session) {
    redirect("/admin/topics");
  }

  return (
    <div className="landing-canvas flex min-h-dvh items-center justify-center px-4">
      <main id="main" tabIndex={-1} className="w-full max-w-md rounded-[1.4rem] border border-[var(--border)] bg-white/85 p-8 shadow-[0_20px_50px_rgba(24,28,48,0.08)]">
        <div className="flex items-center gap-3">
          <Image
            src="/brand/omniaskai-logo.png"
            alt=""
            width={36}
            height={36}
            className="size-9"
          />
          <h1 className="text-xl font-bold tracking-tight">{adminCopy.signInTitle}</h1>
        </div>
        <p className="text-muted mt-3 text-sm leading-relaxed">{adminCopy.signInBody}</p>
        <AdminLoginForm />
      </main>
    </div>
  );
}
