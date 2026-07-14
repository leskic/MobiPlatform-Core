import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: [
      "validator/tests/**/*.test.ts",
      "builder/tests/**/*.test.ts",
      "codec/tests/**/*.test.ts",
      "origin/tests/**/*.test.ts",
      "studio/tests/**/*.test.ts",
      "bridge/tests/**/*.test.ts",
      "bridge/adapters/tests/**/*.test.ts",
      "sync/tests/**/*.test.ts",
      "orchestrator/tests/**/*.test.ts",
      "transaction/tests/**/*.test.ts",
      "presentation/tests/**/*.test.ts",
      "viewer/tests/**/*.test.ts",
      "apps/mobi-studio/tests/**/*.test.ts",
      "apps/mobi-constructor/tests/**/*.test.ts",
      "apps/mobi-sketchup-adapter/tests/**/*.test.ts",
      "apps/mobi-dinabox-adapter/tests/**/*.test.ts",
      "apps/mobidina/tests/**/*.test.ts",
      "apps/mobi-detalhamento/tests/**/*.test.ts",
      "apps/mobi-manufacturing/tests/**/*.test.ts",
      "apps/mobi-cam/tests/**/*.test.ts",
      "apps/mobi-gcode/tests/**/*.test.ts",
      "copilot/tests/**/*.test.ts",
      "copilot/rulebook/packages/tests/**/*.test.ts"
    ]
  }
});
