import type { BOMOutput, PublicBOMLine } from "../industrial-integration/IndustrialContracts";

export interface BOMViewerState {
  readonly status: "NO_DATA" | "READY";
  readonly snapshotSequence: number;
  readonly projectId: string | null;
  readonly version: string | null;
  readonly lines: readonly PublicBOMLine[];
  readonly totals: BOMOutput["totals"] | null;
  readonly groupingKeys: readonly string[];
}
