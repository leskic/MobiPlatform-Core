export type OriginErrorCode = "NO_ACTIVE_PROJECT" | "PROJECT_NOT_FOUND" | "INVALID_PROJECT";

export class OriginError extends Error {
  readonly code: OriginErrorCode;

  constructor(code: OriginErrorCode, message: string) {
    super(message);
    this.name = "OriginError";
    this.code = code;
  }
}
