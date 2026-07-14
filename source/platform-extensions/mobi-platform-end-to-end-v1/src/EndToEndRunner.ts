import { FlowRunner, type FlowExecutionContext, type FlowExecutionResult, type FlowStepTiming } from "../../mobi-platform-flow-v1/src/index";
import {
  IndustrialValidationRunner,
  type IndustrialValidationResult,
} from "../../mobi-platform-industrial-validation-v1/src/index";
import type { ExecutionArtifacts, ExecutionReport } from "./ExecutionArtifacts";
import { ExecutionEvidenceLog } from "./ExecutionEvidence";
import { ExecutionMetricsFactory, type ExecutionMetrics } from "./ExecutionMetrics";
import type { ExecutionSummary } from "./ExecutionSummary";

export interface EndToEndExecutionResult {
  readonly success: boolean;
  readonly summary: ExecutionSummary;
  readonly artifacts: ExecutionArtifacts;
}

export interface EndToEndFlowPort {
  execute(context: FlowExecutionContext): FlowExecutionResult;
}

export interface EndToEndIndustrialValidationPort {
  validate(snapshot: FlowExecutionResult["industrialSnapshot"]): IndustrialValidationResult;
}

export class EndToEndRunner {
  constructor(
    private readonly flowRunner: EndToEndFlowPort = new FlowRunner(),
    private readonly industrialValidation: EndToEndIndustrialValidationPort = new IndustrialValidationRunner(),
    private readonly metricsFactory = new ExecutionMetricsFactory(),
    private readonly now: () => number = () => Date.now(),
    private readonly date: () => string = () => new Date().toISOString(),
  ) {}

  execute(context: FlowExecutionContext): EndToEndExecutionResult {
    const started = this.now();
    const evidence = new ExecutionEvidenceLog();
    const flow = this.flowRunner.execute(context);
    this.collectFlowEvidence(flow, evidence);

    const validationStarted = this.now();
    const validation = this.industrialValidation.validate(flow.industrialSnapshot);
    const industrialValidationMs = Math.max(0, this.now() - validationStarted);
    if (validation.certified) evidence.add("SNAPSHOT_CERTIFIED", "Industrial snapshot certified");

    const success = flow.success && validation.certified;
    evidence.add("FLOW_CLOSED", success ? "End-to-end flow closed successfully" : "End-to-end flow closed with errors");

    const metrics = this.metricsFactory.create(flow.timings, industrialValidationMs, this.successPercent(flow, validation));
    const summary = this.summary(flow, validation, evidence.snapshot(), metrics, Math.max(metrics.totalMs, this.now() - started));
    const report: ExecutionReport = Object.freeze({ summary, generatedAt: this.date() });
    return Object.freeze({
      success,
      summary,
      artifacts: Object.freeze({
        flow,
        industrialValidation: validation,
        report,
        evidence: evidence.snapshot(),
        metrics,
      }),
    });
  }

  private collectFlowEvidence(flow: FlowExecutionResult, evidence: ExecutionEvidenceLog): void {
    if (flow.envelope) evidence.add("PROJECT_LOADED", `Projeto.mobi loaded: ${flow.envelope.projectId}`);
    if (this.hasStep(flow.timings, "VALIDATE_SCHEMA")) evidence.add("SCHEMA_VALIDATED", "Schema validation executed");
    if (this.hasStep(flow.timings, "OPEN_STUDIO")) evidence.add("STUDIO_STARTED", "Mobi Studio started");
    if (this.hasStep(flow.timings, "RUN_CONSTRUCTOR")) evidence.add("CONSTRUCTOR_EXECUTED", "MobiConstructor executed");
    if (flow.industrialSnapshot) evidence.add("SNAPSHOT_PRODUCED", "Industrial snapshot produced");
    if (flow.viewSnapshot) evidence.add("MOBI_VIEW_EXECUTED", "MobiView executed");
  }

  private summary(
    flow: FlowExecutionResult,
    validation: IndustrialValidationResult,
    evidence: readonly ReturnType<ExecutionEvidenceLog["snapshot"]>[number][],
    metrics: ExecutionMetrics,
    totalDurationMs: number,
  ): ExecutionSummary {
    const diagnostics = validation.diagnostics;
    const errors = diagnostics.filter((diagnostic) => diagnostic.severity === "error").length + flow.errors.length;
    const warnings = diagnostics.filter((diagnostic) => diagnostic.severity === "warning").length;
    const productsExecuted = this.productsExecuted(flow, validation);
    const productsApproved = flow.success && validation.certified
      ? ["FlowRunner", "Mobi Studio", "MobiConstructor", "Industrial Validation", "MobiView"]
      : [];
    return Object.freeze({
      projectId: flow.projectId,
      status: flow.success && validation.certified ? "APPROVED" : "FAILED",
      totalDurationMs,
      durationsByStep: this.durations(flow.timings, metrics.industrialValidationMs),
      productsExecuted,
      productsApproved,
      diagnostics,
      warnings,
      errors,
      finalResult: flow.success && validation.certified ? "SUCCESS" : "FAILED",
      evidence,
      metrics,
    });
  }

  private durations(flowTimings: readonly FlowStepTiming[], industrialValidationMs: number): Readonly<Record<string, number>> {
    return Object.freeze({
      ...Object.fromEntries(flowTimings.map((timing) => [timing.step, timing.durationMs])),
      INDUSTRIAL_VALIDATION: industrialValidationMs,
    });
  }

  private productsExecuted(flow: FlowExecutionResult, validation: IndustrialValidationResult): readonly string[] {
    const products = ["FlowRunner"];
    if (this.hasStep(flow.timings, "OPEN_STUDIO")) products.push("Mobi Studio");
    if (this.hasStep(flow.timings, "RUN_CONSTRUCTOR")) products.push("MobiConstructor");
    if (validation.summary.projectId !== null || validation.diagnostics.length > 0) products.push("Industrial Validation");
    if (flow.viewSnapshot) products.push("MobiView");
    return products;
  }

  private successPercent(flow: FlowExecutionResult, validation: IndustrialValidationResult): number {
    const checks = [flow.envelope, flow.success, flow.industrialSnapshot, validation.certified, flow.viewSnapshot];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }

  private hasStep(timings: readonly FlowStepTiming[], step: FlowStepTiming["step"]): boolean {
    return timings.some((timing) => timing.step === step);
  }
}
