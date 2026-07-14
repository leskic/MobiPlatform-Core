import type { ValidationError } from "../../validator/types/ValidationError";

export type CodecErrorCode = "JSON_SYNTAX_ERROR" | "SCHEMA_ERROR" | "SERIALIZATION_ERROR";

export class CodecError extends Error {
  readonly code: CodecErrorCode;
  readonly validationErrors: readonly ValidationError[];

  constructor(code: CodecErrorCode, message: string, validationErrors: readonly ValidationError[] = []) {
    super(message);
    this.name = "CodecError";
    this.code = code;
    this.validationErrors = structuredClone(validationErrors);
  }
}
