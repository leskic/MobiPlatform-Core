import type { EndToEndExecutionResult } from "../../mobi-platform-end-to-end-v1/src/index";
import type { ExecutionScenario } from "./ExecutionScenario";

export interface RealProjectDiagnostics {
  readonly blockers: readonly string[];
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
  readonly improvements: readonly string[];
  readonly bottlenecks: readonly string[];
}

export class ExecutionDiagnostics {
  classify(result: EndToEndExecutionResult, scenario: ExecutionScenario): RealProjectDiagnostics {
    const blockers: string[] = [];
    const errors = result.summary.diagnostics
      .filter((diagnostic) => diagnostic.severity === "error")
      .map((diagnostic) => diagnostic.code);
    const warnings = result.summary.diagnostics
      .filter((diagnostic) => diagnostic.severity === "warning")
      .map((diagnostic) => diagnostic.code);
    const improvements: string[] = [];
    const bottlenecks: string[] = [];

    if (!result.success) blockers.push("REAL_PROJECT_EXECUTION_NOT_APPROVED");
    if (scenario.expectation?.projectId && result.summary.projectId !== scenario.expectation.projectId) {
      blockers.push("EXPECTED_PROJECT_ID_MISMATCH");
    }
    if (scenario.expectation?.minimumSuccessPercent !== undefined && result.summary.metrics.successPercent < scenario.expectation.minimumSuccessPercent) {
      errors.push("SUCCESS_PERCENT_BELOW_EXPECTATION");
    }
    if (scenario.expectation?.maxTotalDurationMs !== undefined && result.summary.totalDurationMs > scenario.expectation.maxTotalDurationMs) {
      warnings.push("TOTAL_DURATION_ABOVE_EXPECTATION");
    }

    const entries = Object.entries(result.summary.durationsByStep);
    const max = entries.reduce<[string, number] | null>((current, entry) => current === null || entry[1] > current[1] ? entry : current, null);
    if (max && max[1] > 0) bottlenecks.push(`${max[0]}:${max[1]}ms`);
    if (warnings.length > 0) improvements.push("Review warning diagnostics before human approval");
    if (result.summary.metrics.successPercent < 100) improvements.push("Investigate incomplete execution stages");

    return Object.freeze({
      blockers,
      errors,
      warnings,
      improvements,
      bottlenecks,
    });
  }
}
