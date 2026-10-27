import { defineConfig, devices } from "@playwright/test";

const url = process.env.E2E_BASE_URL;

export default defineConfig({
  testDir: ".",
  retries: 0,
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  use: { baseURL: url || "http://localhost:13000" },
  webServer: url
    ? undefined
    : {
        command: "make e2e-serve",
        cwd: "..",
        url: "http://localhost:13000",
        reuseExistingServer: false,
        timeout: 600_000,
        gracefulShutdown: { signal: "SIGTERM", timeout: 120_000 },
      },
});
