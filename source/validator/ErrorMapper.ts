import type { ErrorObject } from "ajv";
import type { ValidationError } from "./types/ValidationError";

const CODES: Readonly<Record<string, string>> = {
  required: "REQUIRED_FIELD",
  format: "INVALID_FORMAT",
  enum: "INVALID_ENUM",
  const: "INVALID_CONSTANT",
  type: "INVALID_TYPE",
  additionalProperties: "UNKNOWN_PROPERTY",
  minimum: "VALUE_BELOW_MINIMUM",
  pattern: "INVALID_PATTERN"
};

function valueAt(input: unknown, pointer: string): unknown {
  if (pointer === "") return input;
  return pointer.split("/").slice(1).reduce<unknown>((value, token) => {
    if (typeof value !== "object" || value === null) return undefined;
    const key = token.replace(/~1/g, "/").replace(/~0/g, "~");
    return (value as Record<string, unknown>)[key];
  }, input);
}

function pathFor(error: ErrorObject): string {
  if (error.keyword === "required") {
    const missing = String(error.params.missingProperty);
    return `${error.instancePath}/${missing.replace(/~/g, "~0").replace(/\//g, "~1")}`;
  }
  if (error.keyword === "additionalProperties") {
    return `${error.instancePath}/${String(error.params.additionalProperty)}`;
  }
  return error.instancePath;
}

function expectedFor(error: ErrorObject): unknown {
  switch (error.keyword) {
    case "format": return error.params.format;
    case "enum": return error.params.allowedValues;
    case "const": return error.params.allowedValue;
    case "type": return error.params.type;
    case "minimum": return error.params.limit;
    case "pattern": return error.params.pattern;
    default: return undefined;
  }
}

export function mapErrors(errors: readonly ErrorObject[], input: unknown): ValidationError[] {
  return errors.map((error) => {
    const path = pathFor(error);
    const expected = expectedFor(error);
    const received = valueAt(input, path);
    return {
      code: CODES[error.keyword] ?? "SCHEMA_VALIDATION_ERROR",
      path,
      message: error.message ?? "Schema validation failed",
      ...(expected === undefined ? {} : { expected }),
      ...(received === undefined ? {} : { received })
    };
  });
}
