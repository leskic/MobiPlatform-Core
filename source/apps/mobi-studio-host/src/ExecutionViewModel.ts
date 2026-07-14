import type { ChecklistItem, RealProjectDiagnostics, RealProjectExecutionResult } from "../../../platform-extensions/mobi-platform-real-project-v1/src/index";
import type { ExecutionEvidence } from "../../../platform-extensions/mobi-platform-end-to-end-v1/src/index";

export interface ExecutionDiagnosticItem {
  readonly severity: string;
  readonly code: string;
  readonly message: string;
}

export interface ViewerSnapshotModel {
  readonly projectId: string | null;
  readonly status: string;
  readonly summary: string;
}

export interface ExecutionViewModel {
  readonly status: "APPROVED" | "FAILED";
  readonly projectId: string | null;
  readonly totalDurationMs: number;
  readonly durationsByStep: Readonly<Record<string, number>>;
  readonly productsExecuted: readonly string[];
  readonly productsApproved: readonly string[];
  readonly warnings: number;
  readonly errors: number;
  readonly successPercent: number;
  readonly evidence: readonly ExecutionEvidence[];
  readonly checklist: readonly ChecklistItem[];
  readonly diagnostics: readonly ExecutionDiagnosticItem[];
  readonly diagnosticGroups: RealProjectDiagnostics;
  readonly viewer: ViewerSnapshotModel;
  readonly finalReport: string;
}

export function executionViewModel(result: RealProjectExecutionResult): ExecutionViewModel {
  const summary = result.execution.summary;
  const flow = result.execution.artifacts.flow;
  const viewerSnapshot = flow.viewSnapshot;
  const diagnostics = result.execution.artifacts.industrialValidation.diagnostics.map((diagnostic) => Object.freeze({
    severity: diagnostic.severity,
    code: diagnostic.code,
    message: diagnostic.message,
  }));

  return Object.freeze({
    status: result.approved ? "APPROVED" : "FAILED",
    projectId: summary.projectId,
    totalDurationMs: summary.totalDurationMs,
    durationsByStep: summary.durationsByStep,
    productsExecuted: summary.productsExecuted,
    productsApproved: summary.productsApproved,
    warnings: summary.warnings,
    errors: summary.errors,
    successPercent: summary.metrics.successPercent,
    evidence: summary.evidence,
    checklist: result.checklist,
    diagnostics,
    diagnosticGroups: result.diagnostics,
    viewer: Object.freeze({
      projectId: viewerSnapshot?.projectId ?? null,
      status: viewerSnapshot ? "LOADED" : "UNAVAILABLE",
      summary: viewerSnapshot ? `MobiView renderizou o snapshot do projeto ${viewerSnapshot.projectId}.` : "MobiView nao retornou snapshot.",
    }),
    finalReport: JSON.stringify(result.humanValidationReport.summary, null, 2),
  });
}
