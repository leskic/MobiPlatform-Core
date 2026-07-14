import type {
  BOMOutput,
  IndustrialTransactionPort,
  NeutralCAMPackage,
  ProductionFeedbackStream,
  ProductionManifest,
} from "./IndustrialContracts";

export type IndustrialConnectionStatus = "DISCONNECTED" | "CONNECTED";

export interface IndustrialConnectionState {
  readonly status: IndustrialConnectionStatus;
  readonly connected: boolean;
  readonly projectId: string | null;
  readonly micVersion: string | null;
  readonly lifecycleSequence: number;
}

export interface ConnectedIndustrialContracts {
  readonly manifest: ProductionManifest;
  readonly bom: BOMOutput;
  readonly cam: NeutralCAMPackage;
  readonly feedback: ProductionFeedbackStream;
  readonly transactions: IndustrialTransactionPort;
}
