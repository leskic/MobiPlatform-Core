import type { BOMOutput } from "../industrial-integration/IndustrialContracts";
import type { BOMViewerState } from "./BOMViewerState";

export class BOMViewerConsumer {
  private sequence = 0;
  private state = this.emptyState();

  consume(output: BOMOutput | null | undefined): BOMViewerState {
    this.sequence += 1;
    if (!output) {
      this.state = this.emptyState();
      return this.snapshot();
    }
    this.state = Object.freeze({
      status: "READY",
      snapshotSequence: this.sequence,
      projectId: output.projectId,
      version: output.version,
      lines: structuredClone(output.lines),
      totals: structuredClone(output.totals),
      groupingKeys: structuredClone(output.groupingKeys),
    });
    return this.snapshot();
  }

  disconnect(): BOMViewerState {
    this.sequence += 1;
    this.state = this.emptyState();
    return this.snapshot();
  }

  snapshot(): BOMViewerState {
    return structuredClone(this.state);
  }

  private emptyState(): BOMViewerState {
    return Object.freeze({
      status: "NO_DATA",
      snapshotSequence: this.sequence,
      projectId: null,
      version: null,
      lines: [],
      totals: null,
      groupingKeys: [],
    });
  }
}
