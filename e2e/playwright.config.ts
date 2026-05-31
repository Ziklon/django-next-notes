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

  // The stack (Postgres + backend + frontend) is started externally via
  // `docker compose up --build -d` — either by the CI workflow or manually
  // before running tests locally. reuseExistingServer is always true so
  // Playwright never tries to start a second instance on the same port.
  webServer: {
    command: "docker compose up --build -d",
    cwd: "..",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
