import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // docker compose up --build starts Postgres, runs migrations, seeds the demo
  // user, and serves both the backend and frontend. Playwright waits for the
  // frontend URL to respond before running any tests.
  // Locally an already-running stack is reused; in CI it always rebuilds.
  webServer: {
    command: "docker compose up --build -d",
    cwd: "..",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
