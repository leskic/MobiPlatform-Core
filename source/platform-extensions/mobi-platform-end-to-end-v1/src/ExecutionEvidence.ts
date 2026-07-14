export type ExecutionEvidenceCode =
  | "PROJECT_LOADED"
  | "SCHEMA_VALIDATED"
  | "STUDIO_STARTED"
  | "CONSTRUCTOR_EXECUTED"
  | "SNAPSHOT_PRODUCED"
  | "SNAPSHOT_CERTIFIED"
  | "MOBI_VIEW_EXECUTED"
  | "FLOW_CLOSED";

export interface ExecutionEvidence {
  readonly code: ExecutionEvidenceCode;
  readonly message: string;
}

export class ExecutionEvidenceLog {
  private readonly evidence: ExecutionEvidence[] = [];

  add(code: ExecutionEvidenceCode, message: string): void {
    this.evidence.push(Object.freeze({ code, message }));
  }

  snapshot(): readonly ExecutionEvidence[] {
    return structuredClone(this.evidence);
  }
}
