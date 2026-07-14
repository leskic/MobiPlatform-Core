import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    include: [
      "platform-extensions/mobi-platform-chain-v1/tests/**/*.test.ts",
      "mobi-products/mobi-constructor/tests/**/*.test.ts"
    ],
    coverage: {
      reportsDirectory: "coverage-checkpoint001",
      include: [
        "platform-extensions/mobi-platform-chain-v1/src/**/*.ts",
        "mobi-products/mobi-levantamento/src/**/*.ts",
        "mobi-products/mobi-constructor/src/public-chain/**/*.ts",
        "mobi-products/mobi-view/src/**/*.ts"
      ],
      exclude: ["**/index.ts", "**/*Types.ts", "**/contracts.ts"],
      thresholds: { statements: 95, branches: 95, functions: 95, lines: 95 }
    }
  }
});
