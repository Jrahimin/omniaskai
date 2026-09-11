"use client";

import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth/auth-client";

import { adminCopy } from "./admin-copy";

export function AdminSignOutButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      className="text-muted hover:text-foreground cursor-pointer text-sm font-medium"
      onClick={() => {
        void authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              router.replace("/admin/login");
              router.refresh();
            },
          },
        });
      }}
    >
      {adminCopy.signOut}
    </button>
  );
}
