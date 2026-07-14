import type { MobiOrigin } from "../../origin/MobiOrigin";
import type { BridgeExportAdapter } from "./AdapterRegistry";

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (typeof value !== "object" || value === null) return value;

  const source = value as Record<string, unknown>;
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(source).sort()) {
    result[key] = canonicalize(source[key]);
  }
  return result;
}

export class JsonBridgeExporter implements BridgeExportAdapter {
  readonly id = "json-project";

  constructor(private readonly origin: MobiOrigin) {}

  export(): string {
    return JSON.stringify(canonicalize(this.origin.getProject()));
  }
}
