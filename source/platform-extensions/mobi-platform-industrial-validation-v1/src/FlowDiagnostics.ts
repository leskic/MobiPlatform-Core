export type IndustrialValidationSeverity = "info" | "warning" | "error";
export type IndustrialValidationStage = "MANIFEST" | "BOM" | "CAM" | "FEEDBACK" | "TRANSACTIONS" | "CONSISTENCY";

export interface IndustrialDiagnostic {
  readonly stage: IndustrialValidationStage;
  readonly severity: IndustrialValidationSeverity;
  readonly code: string;
  readonly message: string;
  readonly entity?: string;
}

export class FlowDiagnostics {
  private readonly diagnostics: IndustrialDiagnostic[] = [];

  info(stage: IndustrialValidationStage, code: string, message: string, entity?: string): void {
    this.add(stage, "info", code, message, entity);
  }

  warning(stage: IndustrialValidationStage, code: string, message: string, entity?: string): void {
    this.add(stage, "warning", code, message, entity);
  }

  error(stage: IndustrialValidationStage, code: string, message: string, entity?: string): void {
    this.add(stage, "error", code, message, entity);
  }

  get valid(): boolean {
    return !this.diagnostics.some((diagnostic) => diagnostic.severity === "error");
  }

  snapshot(): readonly IndustrialDiagnostic[] {
    return structuredClone(this.diagnostics);
  }

  merge(other: FlowDiagnostics): void {
    for (const diagnostic of other.snapshot()) this.diagnostics.push(diagnostic);
  }

  private add(
    stage: IndustrialValidationStage,
    severity: IndustrialValidationSeverity,
    code: string,
    message: string,
    entity?: string,
  ): void {
    this.diagnostics.push(Object.freeze({
      stage,
      severity,
      code,
      message,
      ...(entity ? { entity } : {}),
    }));
  }
}
