import type { FlowStepTiming } from "../../mobi-platform-flow-v1/src/index";

export interface ExecutionMetrics {
  readonly loadMs: number;
  readonly validationMs: number;
  readonly studioMs: number;
  readonly constructorMs: number;
  readonly industrialValidationMs: number;
  readonly mobiViewMs: number;
  readonly totalMs: number;
  readonly successPercent: number;
}

export class ExecutionMetricsFactory {
  create(flowTimings: readonly FlowStepTiming[], industrialValidationMs: number, successPercent: number): ExecutionMetrics {
    const duration = (step: FlowStepTiming["step"]) =>
      flowTimings.find((timing) => timing.step === step)?.durationMs ?? 0;
    const loadMs = duration("LOAD_PROJECT");
    const validationMs = duration("VALIDATE_SCHEMA");
    const studioMs = duration("OPEN_STUDIO");
    const constructorMs = duration("RUN_CONSTRUCTOR");
    const mobiViewMs = duration("DELIVER_MOBI_VIEW");
    return Object.freeze({
      loadMs,
      validationMs,
      studioMs,
      constructorMs,
      industrialValidationMs,
      mobiViewMs,
      totalMs: flowTimings.reduce((total, timing) => total + timing.durationMs, 0) + industrialValidationMs,
      successPercent,
    });
  }
}
