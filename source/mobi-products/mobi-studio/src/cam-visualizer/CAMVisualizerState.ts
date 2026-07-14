import type {
  CAMBounds,
  NeutralCAMOperation,
  NeutralCAMPath,
} from "../industrial-integration/IndustrialContracts";

export interface CAMVisualizerState {
  readonly status: "NO_DATA" | "READY";
  readonly snapshotSequence: number;
  readonly projectId: string | null;
  readonly version: string | null;
  readonly sourceContractVersion: string | null;
  readonly layers: readonly string[];
  readonly visibleLayers: readonly string[];
  readonly paths: readonly NeutralCAMPath[];
  readonly operations: readonly NeutralCAMOperation[];
  readonly bounds: CAMBounds | null;
  readonly selectedOperationId: string | null;
}
