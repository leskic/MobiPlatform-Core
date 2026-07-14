import type { IndustrialDiagnostic } from "./FlowDiagnostics";

export interface IndustrialValidationSummary {
  readonly projectId: string | null;
  readonly certified: boolean;
  readonly manifestParts: number;
  readonly bomLines: number;
  readonly camPaths: number;
  readonly camOperations: number;
  readonly feedbackEvents: number;
}

export interface IndustrialValidationResult {
  readonly certified: boolean;
  readonly status: "CERTIFIED" | "REJECTED";
  readonly diagnostics: readonly IndustrialDiagnostic[];
  readonly summary: IndustrialValidationSummary;
}
