export const MIC_VERSION = "1.1.0" as const;
export type MICVersion = typeof MIC_VERSION;

export interface ProductionPartRelation {
  readonly partId: string;
  readonly manufacturingId: string;
  readonly sourceEntityId: string;
  readonly status: "READY" | "STARTED" | "COMPLETED" | "REJECTED";
}

export interface ProductionManifest {
  readonly contract: "mobi.production-manifest";
  readonly version: MICVersion;
  readonly projectId: string;
  readonly exportId: string;
  readonly state: "COMPLETED";
  readonly progress: 100;
  readonly indicators: {
    readonly partCount: number;
    readonly hardwareCount: number;
    readonly operationCount: number;
  };
  readonly parts: readonly ProductionPartRelation[];
}

export interface PublicBOMLine {
  readonly id: string;
  readonly kind: "MATERIAL" | "HARDWARE" | "COMPONENT";
  readonly key: string;
  readonly quantity: number;
  readonly areaMm2: number;
  readonly volumeMm3: number;
  readonly sourceEntityIds: readonly string[];
}

export interface BOMOutput {
  readonly contract: "mobi.bom-output";
  readonly version: MICVersion;
  readonly projectId: string;
  readonly lines: readonly PublicBOMLine[];
  readonly totals: {
    readonly partCount: number;
    readonly hardwareCount: number;
    readonly areaMm2: number;
    readonly volumeMm3: number;
  };
  readonly groupingKeys: readonly string[];
}

export interface CAMPoint {
  readonly x: number;
  readonly y: number;
}

export interface CAMBounds {
  readonly minX: number;
  readonly minY: number;
  readonly maxX: number;
  readonly maxY: number;
}

export interface NeutralCAMPath {
  readonly id: string;
  readonly partId: string;
  readonly sheetId: string;
  readonly entityId: string;
  readonly layer: "CUT_OUTLINE";
  readonly closed: true;
  readonly points: readonly CAMPoint[];
  readonly bounds: CAMBounds;
}

export interface NeutralCAMOperation {
  readonly id: string;
  readonly partId: string;
  readonly entityId: string;
  readonly kind: "PROFILE" | "EDGE";
  readonly pathId: string;
  readonly parameters: Readonly<Record<string, number | string>>;
}

export interface NeutralCAMPackage {
  readonly contract: "mobi.neutral-cam-package";
  readonly version: MICVersion;
  readonly projectId: string;
  readonly sourceContractVersion: "1.0.0";
  readonly layers: readonly ["CUT_OUTLINE"];
  readonly paths: readonly NeutralCAMPath[];
  readonly operations: readonly NeutralCAMOperation[];
  readonly bounds: CAMBounds;
}

export interface ProductionFeedbackEvent {
  readonly contract: "mobi.production-feedback-event";
  readonly version: MICVersion;
  readonly eventId: string;
  readonly projectId: string;
  readonly partId: string;
  readonly logicalTimestamp: number;
  readonly status: "STARTED" | "COMPLETED" | "REJECTED" | "TELEMETRY";
  readonly telemetry?: {
    readonly metric: string;
    readonly value: number;
    readonly unit: string;
  };
}

export interface ProductionFeedbackStream {
  subscribe(listener: (event: ProductionFeedbackEvent) => void): () => void;
  snapshot(): readonly ProductionFeedbackEvent[];
}

export type IndustrialTransactionCommand =
  | "EXPORT_STARTED"
  | "EXPORT_COMPLETED"
  | "INDUSTRIAL_VIEWED";

export interface IndustrialTransactionResult {
  readonly success: boolean;
  readonly transactionId?: string;
  readonly errorCode?: string;
}

export interface IndustrialTransactionPort {
  record(
    command: IndustrialTransactionCommand,
    projectId: string,
    referenceId: string,
  ): IndustrialTransactionResult;
}

export interface IndustrialContractSnapshot {
  readonly manifest: ProductionManifest;
  readonly bom: BOMOutput;
  readonly cam: NeutralCAMPackage;
  readonly feedback: ProductionFeedbackStream;
  readonly transactions: IndustrialTransactionPort;
}

export interface PublicTransactionCommand {
  readonly id: string;
  readonly entityId: string;
  readonly property: "industrialEvent";
  readonly value: Readonly<{
    command: IndustrialTransactionCommand;
    referenceId: string;
    micVersion: MICVersion;
  }>;
  readonly author: "mobi-constructor";
  readonly logicalTimestamp: number;
  readonly operationName: IndustrialTransactionCommand;
  readonly operation: (state: unknown) => void;
  readonly preview: {
    readonly apply: (state: unknown) => void;
    readonly revert: (state: unknown) => void;
  };
}

export interface IndustrialTransactionCoordinatorPort {
  execute(command: PublicTransactionCommand): IndustrialTransactionResult;
}
