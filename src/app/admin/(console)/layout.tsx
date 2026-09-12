import { redirect } from "next/navigation";

import { AdminShell } from "@/features/admin/admin-shell";
import { getAdminSession } from "@/features/admin/require-admin-session";

export const dynamic = "force-dynamic";

export default async function AdminConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return <AdminShell email={session.email}>{children}</AdminShell>;
}
