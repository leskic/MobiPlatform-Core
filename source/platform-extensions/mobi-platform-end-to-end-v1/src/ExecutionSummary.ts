import type { IndustrialDiagnostic } from "../../mobi-platform-industrial-validation-v1/src/index";
import type { ExecutionEvidence } from "./ExecutionEvidence";
import type { ExecutionMetrics } from "./ExecutionMetrics";

export type EndToEndStatus = "APPROVED" | "FAILED";

export interface ExecutionSummary {
  readonly projectId: string | null;
  readonly status: EndToEndStatus;
  readonly totalDurationMs: number;
  readonly durationsByStep: Readonly<Record<string, number>>;
  readonly productsExecuted: readonly string[];
  readonly productsApproved: readonly string[];
  readonly diagnostics: readonly IndustrialDiagnostic[];
  readonly warnings: number;
  readonly errors: number;
  readonly finalResult: "SUCCESS" | "FAILED";
  readonly evidence: readonly ExecutionEvidence[];
  readonly metrics: ExecutionMetrics;
}
