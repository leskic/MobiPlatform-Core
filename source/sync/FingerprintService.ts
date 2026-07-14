import { createHash } from "node:crypto";
import { Fingerprint } from "./Fingerprint";

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (typeof value !== "object" || value === null) return value;
  const source = value as Record<string, unknown>;
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(source).sort()) result[key] = canonicalize(source[key]);
  return result;
}

export class FingerprintService {
  generate(value: unknown): Fingerprint {
    const serialized = JSON.stringify(canonicalize(value));
    const digest = createHash("sha256").update(serialized ?? "undefined").digest("hex");
    return new Fingerprint(digest);
  }
  compare(source: Fingerprint, destination: Fingerprint): boolean {
    return source.equals(destination);
  }
}
