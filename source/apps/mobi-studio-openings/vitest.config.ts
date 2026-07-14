import { defineConfig } from "vitest/config";
export default defineConfig({ test: { include: ["apps/mobi-studio-openings/tests/**/*.test.ts"], coverage: { include: ["apps/mobi-studio-openings/src/**/*.ts"], exclude: ["**/index.ts", "**/*Types.ts"], thresholds: { statements: 95, branches: 95, functions: 95, lines: 95 } } } });
