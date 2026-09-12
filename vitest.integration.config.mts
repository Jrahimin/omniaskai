import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.integration.test.ts"],
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 30_000,
    env: {
      APP_ORIGIN: process.env.APP_ORIGIN ?? "http://localhost:3011",
      BETTER_AUTH_SECRET:
        process.env.BETTER_AUTH_SECRET ??
        "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
      MEDIA_STORAGE_DIR: process.env.MEDIA_STORAGE_DIR ?? "./storage/media-test",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(root, "src"),
      "server-only": path.resolve(root, "vitest.server-only.ts"),
    },
  },
});
