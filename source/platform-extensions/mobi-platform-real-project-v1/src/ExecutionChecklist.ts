import type { EndToEndExecutionResult } from "../../mobi-platform-end-to-end-v1/src/index";

export type ChecklistCode =
  | "PROJECT_LOADED"
  | "SCHEMA_VALID"
  | "STUDIO_STARTED"
  | "CONSTRUCTOR_EXECUTED"
  | "INDUSTRIAL_SNAPSHOT"
  | "SNAPSHOT_CERTIFIED"
  | "VIEWER_LOADED"
  | "FINAL_SUMMARY";

export interface ChecklistItem {
  readonly code: ChecklistCode;
  readonly passed: boolean;
  readonly message: string;
}

export class ExecutionChecklist {
  evaluate(result: EndToEndExecutionResult): readonly ChecklistItem[] {
    const evidence = new Set(result.summary.evidence.map((item) => item.code));
    const flow = result.artifacts.flow;
    return Object.freeze([
      this.item("PROJECT_LOADED", Boolean(flow.envelope), "Projeto.mobi loaded"),
      this.item("SCHEMA_VALID", evidence.has("SCHEMA_VALIDATED") && flow.errors.length === 0, "Schema validated"),
      this.item("STUDIO_STARTED", evidence.has("STUDIO_STARTED"), "Studio started"),
      this.item("CONSTRUCTOR_EXECUTED", evidence.has("CONSTRUCTOR_EXECUTED"), "Constructor executed"),
      this.item("INDUSTRIAL_SNAPSHOT", Boolean(flow.industrialSnapshot), "Industrial snapshot produced"),
      this.item("SNAPSHOT_CERTIFIED", result.artifacts.industrialValidation.certified, "Industrial snapshot certified"),
      this.item("VIEWER_LOADED", evidence.has("MOBI_VIEW_EXECUTED"), "MobiView loaded"),
      this.item("FINAL_SUMMARY", result.summary.finalResult === "SUCCESS", "Final summary approved"),
    ]);
  }

  private item(code: ChecklistCode, passed: boolean, message: string): ChecklistItem {
    return Object.freeze({ code, passed, message });
  }
}
