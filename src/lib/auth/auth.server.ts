import "server-only";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";

import { getDatabase } from "@/lib/db/database";
import {
  authAccount,
  authRateLimit,
  authSession,
  authUser,
  authVerification,
} from "@/lib/db/schema";

import { getAppOrigin, getBetterAuthSecret } from "./auth-env";

const ADMIN_PLUGIN_PATHS = [
  "/admin/create-user",
  "/admin/list-users",
  "/admin/set-role",
  "/admin/set-user-password",
  "/admin/set-user-email",
  "/admin/update-user",
  "/admin/ban-user",
  "/admin/unban-user",
  "/admin/impersonate-user",
  "/admin/stop-impersonating",
  "/admin/remove-user",
  "/admin/get-user",
  "/admin/list-user-sessions",
  "/admin/revoke-user-session",
  "/admin/revoke-user-sessions",
  "/admin/has-permission",
  "/admin/check-role-permission",
] as const;

const UNUSED_ACCOUNT_PATHS = [
  "/sign-up/email",
  "/forget-password",
  "/request-password-reset",
  "/reset-password",
  "/change-password",
  "/change-email",
  "/send-verification-email",
  "/verify-email",
  "/update-user",
  "/delete-user",
  "/list-sessions",
  "/revoke-session",
  "/revoke-other-sessions",
  "/revoke-sessions",
  "/list-accounts",
  "/unlink-account",
  "/link-social",
] as const;

const globalForAuth = globalThis as {
  omniaskaiAuth?: ReturnType<typeof createAuth>;
};

function createAuth() {
  return betterAuth({
    appName: "OmniAskAI",
    baseURL: getAppOrigin(),
    secret: getBetterAuthSecret(),
    trustedOrigins: [getAppOrigin()],
    database: drizzleAdapter(getDatabase(), {
      provider: "pg",
      schema: {
        user: authUser,
        session: authSession,
        account: authAccount,
        verification: authVerification,
        rateLimit: authRateLimit,
      },
    }),
    emailAndPassword: {
      enabled: true,
      disableSignUp: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
    },
    session: {
      expiresIn: 8 * 60 * 60,
      disableSessionRefresh: true,
      cookieCache: {
        enabled: false,
      },
    },
    rateLimit: {
      enabled: true,
      storage: "database",
      window: 60,
      max: 100,
      customRules: {
        "/sign-in/email": {
          window: 60,
          max: 5,
        },
        "/get-session": false,
        "/sign-out": false,
      },
    },
    user: {
      changeEmail: { enabled: false },
      deleteUser: { enabled: false },
    },
    account: {
      accountLinking: {
        enabled: false,
      },
    },
    advanced: {
      useSecureCookies: process.env.NODE_ENV === "production",
      defaultCookieAttributes: {
        httpOnly: true,
        sameSite: "lax",
      },
    },
    telemetry: {
      enabled: false,
    },
    disabledPaths: [...UNUSED_ACCOUNT_PATHS, ...ADMIN_PLUGIN_PATHS],
    plugins: [
      admin({
        defaultRole: "user",
        adminRoles: ["admin"],
      }),
      nextCookies(),
    ],
  });
}

export function getAuth() {
  if (!globalForAuth.omniaskaiAuth) {
    globalForAuth.omniaskaiAuth = createAuth();
  }

  return globalForAuth.omniaskaiAuth;
}

export type AuthInstance = ReturnType<typeof createAuth>;
