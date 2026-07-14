import type {
  MobiViewFeedbackEventV1,
  MobiViewIndustrialPortV1,
} from "../../../platform-extensions/mobi-platform-chain-v1/src/index";

export interface MobiViewSnapshot {
  readonly projectId: string;
  readonly production: { readonly state: string; readonly progress: number; readonly partCount: number };
  readonly bomRows: number;
  readonly cam: { readonly layers: readonly string[]; readonly paths: number; readonly operations: number; readonly bounds: { readonly minX: number; readonly minY: number; readonly maxX: number; readonly maxY: number } };
  readonly timeline: readonly MobiViewFeedbackEventV1[];
}

export class MobiViewIntegration {
  private timeline: MobiViewFeedbackEventV1[] = [];
  private unsubscribe: (() => void) | undefined;
  private current: MobiViewIndustrialPortV1 | undefined;

  connect(contracts: MobiViewIndustrialPortV1): MobiViewSnapshot {
    this.disconnect();
    this.current = contracts;
    this.timeline = [...structuredClone(contracts.feedback.snapshot())];
    this.unsubscribe = contracts.feedback.subscribe((event) => {
      this.timeline = [...this.timeline, structuredClone(event)];
    });
    contracts.transactions.record("INDUSTRIAL_VIEWED", contracts.manifest.projectId, contracts.manifest.exportId);
    return this.snapshot();
  }

  snapshot(): MobiViewSnapshot {
    if (!this.current) throw new Error("MOBI_VIEW_NOT_CONNECTED");
    return {
      projectId: this.current.manifest.projectId,
      production: {
        state: this.current.manifest.state,
        progress: this.current.manifest.progress,
        partCount: this.current.manifest.indicators.partCount,
      },
      bomRows: this.current.bom.lines.length,
      cam: {
        layers: structuredClone(this.current.cam.layers),
        paths: this.current.cam.paths.length,
        operations: this.current.cam.operations.length,
        bounds: structuredClone(this.current.cam.bounds),
      },
      timeline: structuredClone(this.timeline),
    };
  }

  disconnect(): boolean {
    if (!this.current) return false;
    this.unsubscribe?.();
    this.unsubscribe = undefined;
    this.current = undefined;
    this.timeline = [];
    return true;
  }
}
