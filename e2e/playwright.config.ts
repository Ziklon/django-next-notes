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

  // Start both servers when they are not already running.
  webServer: [
    {
      command: "cd ../backend && uv run python manage.py runserver 8000 --noreload",
      port: 8000,
      reuseExistingServer: true,
    },
    {
      command: "cd ../frontend && pnpm dev",
      port: 3000,
      reuseExistingServer: true,
    },
  ],
});
