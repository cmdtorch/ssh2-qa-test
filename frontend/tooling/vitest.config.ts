import { resolve } from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    root: resolve(import.meta.dirname, ".."),
    include: ["tooling/**/*.test.ts"],
    environment: "node",
    fileParallelism: false,
    testTimeout: 120_000,
    reporters: ["verbose"],
  },
});
