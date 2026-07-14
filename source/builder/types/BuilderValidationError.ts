import type { ValidationResult } from "../../validator/types/ValidationResult";

export class BuilderValidationError extends Error {
  readonly result: ValidationResult;

  constructor(result: ValidationResult) {
    super("Project.mobi validation failed");
    this.name = "BuilderValidationError";
    this.result = structuredClone(result);
  }
}
