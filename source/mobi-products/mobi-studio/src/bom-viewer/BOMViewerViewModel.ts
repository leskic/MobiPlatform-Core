import type { PublicBOMLine } from "../industrial-integration/IndustrialContracts";

export interface BOMViewerGroup {
  readonly key: string;
  readonly lines: readonly PublicBOMLine[];
}

export interface BOMViewerViewModel {
  readonly component: "BOM_VIEWER";
  readonly hasData: boolean;
  readonly projectId: string | null;
  readonly version: string | null;
  readonly lines: readonly PublicBOMLine[];
  readonly groups: readonly BOMViewerGroup[];
}
