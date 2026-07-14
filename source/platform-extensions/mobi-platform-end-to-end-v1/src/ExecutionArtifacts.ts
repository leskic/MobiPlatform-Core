import type { FlowExecutionResult } from "../../mobi-platform-flow-v1/src/index";
import type { IndustrialValidationResult } from "../../mobi-platform-industrial-validation-v1/src/index";
import type { ExecutionEvidence } from "./ExecutionEvidence";
import type { ExecutionMetrics } from "./ExecutionMetrics";
import type { ExecutionSummary } from "./ExecutionSummary";

export interface ExecutionReport {
  readonly summary: ExecutionSummary;
  readonly generatedAt: string;
}

export interface ExecutionArtifacts {
  readonly flow: FlowExecutionResult;
  readonly industrialValidation: IndustrialValidationResult;
  readonly report: ExecutionReport;
  readonly evidence: readonly ExecutionEvidence[];
  readonly metrics: ExecutionMetrics;
}
