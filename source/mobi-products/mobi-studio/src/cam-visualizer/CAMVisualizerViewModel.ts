import type {
  CAMBounds,
  NeutralCAMOperation,
  NeutralCAMPath,
} from "../industrial-integration/IndustrialContracts";

export interface CAMVisualizerViewModel {
  readonly component: "CAM_VISUALIZER";
  readonly hasData: boolean;
  readonly projectId: string | null;
  readonly version: string | null;
  readonly sourceContractVersion: string | null;
  readonly layers: readonly { readonly id: string; readonly visible: boolean }[];
  readonly paths: readonly NeutralCAMPath[];
  readonly operations: readonly NeutralCAMOperation[];
  readonly bounds: CAMBounds | null;
  readonly selectedOperation: NeutralCAMOperation | null;
}

export interface CAMVisualizerRenderer {
  render(viewModel: CAMVisualizerViewModel): void;
}
