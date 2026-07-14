import type { IndustrialContractSnapshot } from "../../../mobi-products/mobi-constructor/src/index";
import type { MobiViewSnapshot } from "../../../mobi-products/mobi-view/src/index";
import type { ProjectMobiEnvelopeV1 } from "../../mobi-platform-chain-v1/src/index";

export type FlowStepName =
  | "LOAD_PROJECT"
  | "VALIDATE_SCHEMA"
  | "OPEN_STUDIO"
  | "RUN_CONSTRUCTOR"
  | "GENERATE_SNAPSHOT"
  | "DELIVER_MOBI_VIEW"
  | "VALIDATE_VIEW"
  | "CLEANUP";

export interface FlowStepTiming {
  readonly step: FlowStepName;
  readonly startedAt: number;
  readonly finishedAt: number;
  readonly durationMs: number;
}

export interface FlowExecutionError {
  readonly step: FlowStepName;
  readonly code: string;
  readonly message: string;
}

export interface FlowExecutionReport {
  readonly status: "APPROVED" | "FAILED";
  readonly projectId: string | null;
  readonly sessionId: string;
  readonly steps: readonly FlowStepTiming[];
  readonly errors: readonly FlowExecutionError[];
  readonly evidence: readonly string[];
  readonly totalDurationMs: number;
}

export interface FlowExecutionResult {
  readonly success: boolean;
  readonly status: "APPROVED" | "FAILED";
  readonly projectId: string | null;
  readonly envelope?: ProjectMobiEnvelopeV1;
  readonly industrialSnapshot?: IndustrialContractSnapshot;
  readonly viewSnapshot?: MobiViewSnapshot;
  readonly timings: readonly FlowStepTiming[];
  readonly errors: readonly FlowExecutionError[];
  readonly report: FlowExecutionReport;
}
