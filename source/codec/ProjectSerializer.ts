import { validate } from "../validator/SchemaValidator";
import { CodecError } from "./types/CodecError";

function assertJsonValue(value: unknown, seen: Set<object>): void {
  if (value === null || typeof value === "string" || typeof value === "boolean") return;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new CodecError("SERIALIZATION_ERROR", "Project contains a non-finite number");
    return;
  }
  if (typeof value !== "object") {
    throw new CodecError("SERIALIZATION_ERROR", "Project contains a value unsupported by JSON");
  }
  if (seen.has(value)) throw new CodecError("SERIALIZATION_ERROR", "Project contains a circular reference");
  seen.add(value);
  if (Array.isArray(value)) {
    for (const item of value) assertJsonValue(item, seen);
  } else {
    const prototype = Object.getPrototypeOf(value) as unknown;
    if (prototype !== Object.prototype && prototype !== null) {
      throw new CodecError("SERIALIZATION_ERROR", "Project contains a non-plain object");
    }
    for (const item of Object.values(value)) assertJsonValue(item, seen);
  }
  seen.delete(value);
}

export class ProjectSerializer {
  static serialize(project: unknown): string {
    const validation = validate(project);
    if (!validation.valid) {
      throw new CodecError("SCHEMA_ERROR", "Project does not match Projeto.mobi schema", validation.errors);
    }
    assertJsonValue(project, new Set<object>());
    try {
      return JSON.stringify(project);
    } catch {
      throw new CodecError("SERIALIZATION_ERROR", "Project could not be serialized");
    }
  }
}
