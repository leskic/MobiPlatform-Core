export type CopilotErrorCode = "NO_ACTIVE_SESSION" | "ANALYSIS_NOT_STARTED";

export class CopilotError extends Error {
  readonly code: CopilotErrorCode;

  constructor(code: CopilotErrorCode, message: string) {
    super(message);
    this.name = "CopilotError";
    this.code = code;
  }
}
