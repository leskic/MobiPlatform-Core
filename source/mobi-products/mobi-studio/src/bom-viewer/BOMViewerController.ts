import type { BOMOutput } from "../industrial-integration/IndustrialContracts";
import { BOMFilter, type BOMFilterOptions } from "./BOMFilter";
import { BOMGrouping, type BOMGroupingMode } from "./BOMGrouping";
import { BOMSelectionBridge, type BOMSelectionResult } from "./BOMSelectionBridge";
import { BOMViewerConsumer } from "./BOMViewerConsumer";
import type { BOMViewerState } from "./BOMViewerState";
import type { BOMViewerViewModel } from "./BOMViewerViewModel";

export interface BOMViewerOptions extends BOMFilterOptions {
  readonly groupBy?: BOMGroupingMode;
}

export class BOMViewerController {
  constructor(
    private readonly consumer = new BOMViewerConsumer(),
    private readonly filter = new BOMFilter(),
    private readonly grouping = new BOMGrouping(),
    private readonly selection?: BOMSelectionBridge,
  ) {}

  connect(output: BOMOutput | null | undefined): BOMViewerViewModel {
    this.consumer.consume(output);
    return this.view();
  }

  update(output: BOMOutput | null | undefined): BOMViewerViewModel {
    this.consumer.consume(output);
    return this.view();
  }

  disconnect(): BOMViewerViewModel {
    this.consumer.disconnect();
    this.selection?.clear();
    return this.view();
  }

  view(options: Readonly<BOMViewerOptions> = {}): BOMViewerViewModel {
    const state = this.consumer.snapshot();
    const lines = this.filter.apply(state.lines, options);
    return Object.freeze({
      component: "BOM_VIEWER",
      hasData: state.status === "READY",
      projectId: state.projectId,
      version: state.version,
      lines,
      groups: this.grouping.group(lines, options.groupBy ?? "NONE"),
    });
  }

  select(lineId: string, sourceEntityId: string): BOMSelectionResult {
    const line = this.consumer.snapshot().lines.find((candidate) => candidate.id === lineId);
    if (!line || !this.selection) return { success: false, code: "INVALID_SOURCE_ENTITY_ID" };
    return this.selection.select(line, sourceEntityId);
  }

  getState(): BOMViewerState {
    return this.consumer.snapshot();
  }
}
