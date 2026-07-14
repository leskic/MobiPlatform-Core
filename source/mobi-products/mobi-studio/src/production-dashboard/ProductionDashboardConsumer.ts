import type { ProductionManifest } from "../industrial-integration/IndustrialContracts";
import {
  availableField,
  type ProductionDashboardField,
  type ProductionDashboardState,
  unavailableField,
} from "./ProductionDashboardState";

export type ProductionManifestInput = ProductionManifest | Partial<ProductionManifest>;

export class ProductionDashboardConsumer {
  private sequence = 0;
  private state = this.emptyState();

  consume(manifest: ProductionManifestInput | null | undefined): ProductionDashboardState {
    this.sequence += 1;
    if (!manifest || typeof manifest !== "object") {
      this.state = this.emptyState();
      return this.snapshot();
    }

    const record = manifest as Readonly<Record<string, unknown>>;
    const indicators = this.record(record.indicators);
    const version = this.string(record.version);
    this.state = Object.freeze({
      status: "READY",
      snapshotSequence: this.sequence,
      projectName: unavailableField<string>(),
      productionStatus: this.stringField(record.state),
      progress: this.numberField(record.progress),
      totalParts: this.numberField(indicators?.partCount),
      producedParts: unavailableField<number>(),
      pendingParts: unavailableField<number>(),
      failedParts: unavailableField<number>(),
      updatedAt: unavailableField<string>(),
      manifestVersion: version ? availableField(version) : unavailableField<string>(),
      micVersion: version ? availableField(version) : unavailableField<string>(),
      productionId: this.stringField(record.exportId),
    });
    return this.snapshot();
  }

  disconnect(): ProductionDashboardState {
    this.sequence += 1;
    this.state = this.emptyState();
    return this.snapshot();
  }

  snapshot(): ProductionDashboardState {
    return structuredClone(this.state);
  }

  private emptyState(): ProductionDashboardState {
    return Object.freeze({
      status: "NO_DATA",
      snapshotSequence: this.sequence,
      projectName: unavailableField<string>(),
      productionStatus: unavailableField<string>(),
      progress: unavailableField<number>(),
      totalParts: unavailableField<number>(),
      producedParts: unavailableField<number>(),
      pendingParts: unavailableField<number>(),
      failedParts: unavailableField<number>(),
      updatedAt: unavailableField<string>(),
      manifestVersion: unavailableField<string>(),
      micVersion: unavailableField<string>(),
      productionId: unavailableField<string>(),
    });
  }

  private stringField(value: unknown): ProductionDashboardField<string> {
    const valid = this.string(value);
    return valid ? availableField(valid) : unavailableField<string>();
  }

  private numberField(value: unknown): ProductionDashboardField<number> {
    return typeof value === "number" && Number.isFinite(value)
      ? availableField(value)
      : unavailableField<number>();
  }

  private string(value: unknown): string | undefined {
    return typeof value === "string" && value.trim() ? value : undefined;
  }

  private record(value: unknown): Readonly<Record<string, unknown>> | undefined {
    return value && typeof value === "object"
      ? (value as Readonly<Record<string, unknown>>)
      : undefined;
  }
}
