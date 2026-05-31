import type { Config } from "jest";
import nextJest from "next/jest";

const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^react-markdown$": "<rootDir>/__mocks__/react-markdown.tsx",
    "^remark-gfm$": "<rootDir>/__mocks__/remark-gfm.ts",
    "^remark-emoji$": "<rootDir>/__mocks__/remark-emoji.ts",
  },
  // Pick up integration tests in the top-level tests/ folder.
  testMatch: [
    "**/__tests__/**/*.[jt]s?(x)",
    "**/?(*.)+(spec|test).[jt]s?(x)",
    "<rootDir>/tests/**/*.test.[jt]s?(x)",
  ],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    // Next.js app-router entry/boilerplate (layout, page, metadata).
    "!src/app/**",
    "!src/**/__tests__/**",
    // Next.js edge middleware — uses NextRequest/NextResponse, not testable in Jest.
    "!src/middleware.ts",
    // Test infrastructure — not production code.
    "!src/test-utils/**",
  ],
  coverageReporters: ["text", "text-summary", "html", "lcov"],
  coverageThreshold: {
    global: {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
};

export default createJestConfig(config);
