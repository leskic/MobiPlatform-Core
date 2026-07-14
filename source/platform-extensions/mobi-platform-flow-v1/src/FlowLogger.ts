import type { FlowExecutionError, FlowExecutionReport, FlowStepName, FlowStepTiming } from "./FlowExecutionResult";

export class FlowLogger {
  private readonly timings: FlowStepTiming[] = [];
  private readonly errors: FlowExecutionError[] = [];
  private readonly evidence: string[] = [];

  constructor(private readonly now: () => number = () => Date.now()) {}

  measure<T>(step: FlowStepName, operation: () => T): T {
    const startedAt = this.now();
    try {
      return operation();
    } finally {
      const finishedAt = this.now();
      this.timings.push(Object.freeze({
        step,
        startedAt,
        finishedAt,
        durationMs: Math.max(0, finishedAt - startedAt),
      }));
    }
  }

  info(message: string): void {
    this.evidence.push(message);
  }

  error(error: FlowExecutionError): void {
    this.errors.push(Object.freeze(error));
  }

  snapshot(): { timings: readonly FlowStepTiming[]; errors: readonly FlowExecutionError[]; evidence: readonly string[] } {
    return {
      timings: structuredClone(this.timings),
      errors: structuredClone(this.errors),
      evidence: structuredClone(this.evidence),
    };
  }

  report(status: "APPROVED" | "FAILED", projectId: string | null, sessionId: string): FlowExecutionReport {
    const { timings, errors, evidence } = this.snapshot();
    return Object.freeze({
      status,
      projectId,
      sessionId,
      steps: timings,
      errors,
      evidence,
      totalDurationMs: timings.reduce((total, item) => total + item.durationMs, 0),
    });
  }
}
