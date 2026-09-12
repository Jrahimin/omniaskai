"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth/auth-client";

import { adminCopy } from "./admin-copy";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="mt-8 flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setPending(true);
        setError(null);
        void authClient.signIn.email(
          { email, password },
          {
            onSuccess: () => {
              router.replace("/admin/topics");
              router.refresh();
            },
            onError: () => {
              setPending(false);
              setError(adminCopy.signInError);
            },
          },
        );
      }}
    >
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">{adminCopy.email}</span>
        <input
          type="email"
          name="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 outline-none focus:ring-2 focus:ring-[var(--brand)]/30"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">{adminCopy.password}</span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 outline-none focus:ring-2 focus:ring-[var(--brand)]/30"
        />
      </label>
      {error ? <p className="text-sm text-[#8a3a30]">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="bg-brand text-white mt-2 cursor-pointer rounded-full px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
      >
        {adminCopy.signIn}
      </button>
    </form>
  );
}
