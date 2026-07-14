export const PLATFORM_CHAIN_VERSION = "1.0.0" as const;

export interface Vector3V1 { readonly x: number; readonly y: number; readonly z: number }
export interface Size3V1 { readonly width: number; readonly height: number; readonly depth: number }

export interface SurveyArchitectureV1 {
  readonly id: string;
  readonly type: "wall" | "floor" | "ceiling" | "opening";
  readonly hostId?: string | null;
  readonly size: Size3V1;
  readonly position: Vector3V1;
  readonly rotation: Vector3V1;
  readonly referencePlane: Vector3V1;
  readonly finish: string;
}

export interface SurveyEnvironmentV1 {
  readonly id: string;
  readonly displayName: string;
  readonly code: string;
  readonly order: number;
  readonly architectures: readonly SurveyArchitectureV1[];
  readonly modules: readonly SurveyModuleV1[];
}

export interface SurveyPartV1 {
  readonly id: string;
  readonly category: "structural" | "front" | "internal" | "finish";
  readonly type: "side_panel" | "door" | "drawer_front" | "shelf" | "back_panel" | "decorative";
  readonly size: { readonly width: number; readonly height: number; readonly thickness: number };
  readonly position: Vector3V1;
  readonly rotation: Vector3V1;
  readonly materialId: string;
  readonly edgeBanding: Readonly<Record<"top" | "bottom" | "left" | "right" | "front" | "back", { readonly applied: boolean; readonly materialId?: string }>>;
  readonly grainDirection: "lengthwise" | "crosswise" | "none";
}

export interface SurveyModuleV1 {
  readonly id: string;
  readonly code: string;
  readonly displayName: string;
  readonly type: "base" | "wall" | "tower" | "island" | "panel" | "closet" | "office";
  readonly position: Vector3V1;
  readonly rotation: Vector3V1;
  readonly parts: readonly SurveyPartV1[];
}

export interface MobiLevantamentoInputV1 {
  readonly contract: "mobi.levantamento-input";
  readonly version: typeof PLATFORM_CHAIN_VERSION;
  readonly project: {
    readonly id: string;
    readonly displayName: string;
    readonly code: string;
    readonly source: "mobi-levantamento";
    readonly createdAt: string;
    readonly updatedAt: string;
  };
  readonly environments: readonly SurveyEnvironmentV1[];
}

export interface ProjectMobiEnvelopeV1 {
  readonly contract: "mobi.project-envelope";
  readonly version: typeof PLATFORM_CHAIN_VERSION;
  readonly schemaVersion: "1.0.0";
  readonly projectId: string;
  readonly mediaType: "application/vnd.mobi.project+json";
  readonly payload: string;
  readonly fingerprint: string;
}

export interface ProjectMobiProducerPortV1 {
  produce(input: MobiLevantamentoInputV1): ProjectMobiEnvelopeV1;
}

export interface ConstructorPartV1 {
  readonly id: string;
  readonly parentId: string;
  readonly size: { readonly width: number; readonly height: number; readonly thickness: number };
  readonly position: Vector3V1;
  readonly materialId: string;
  readonly edgeBanding: {
    readonly top: { readonly applied: boolean; readonly materialId?: string };
    readonly bottom: { readonly applied: boolean; readonly materialId?: string };
    readonly left: { readonly applied: boolean; readonly materialId?: string };
    readonly right: { readonly applied: boolean; readonly materialId?: string };
    readonly front: { readonly applied: boolean; readonly materialId?: string };
    readonly back: { readonly applied: boolean; readonly materialId?: string };
  };
}

export interface ConstructorProjectV1 {
  readonly id: string;
  readonly displayName: string;
  readonly schemaVersion: string;
  readonly measurementUnit: string;
  readonly rotationUnit: string;
  readonly environments: readonly {
    readonly id: string;
    readonly modules: readonly {
      readonly id: string;
      readonly parentId: string;
      readonly parts: readonly ConstructorPartV1[];
      readonly hardwares: readonly {
        readonly id: string; readonly parentId: string; readonly catalogId: string;
        readonly type: string; readonly category: string; readonly position: Vector3V1;
      }[];
    }[];
  }[];
}

export interface ProjectMobiReaderPortV1 {
  read(envelope: ProjectMobiEnvelopeV1): ConstructorProjectV1;
}

export interface MobiViewFeedbackEventV1 {
  readonly contract: "mobi.production-feedback-event";
  readonly version: "1.1.0";
  readonly eventId: string;
  readonly projectId: string;
  readonly partId: string;
  readonly logicalTimestamp: number;
  readonly status: "STARTED" | "COMPLETED" | "REJECTED" | "TELEMETRY";
  readonly telemetry?: { readonly metric: string; readonly value: number; readonly unit: string };
}

export interface MobiViewIndustrialPortV1 {
  readonly manifest: {
    readonly projectId: string; readonly exportId: string; readonly state: string;
    readonly progress: number; readonly indicators: { readonly partCount: number };
  };
  readonly bom: { readonly lines: readonly unknown[] };
  readonly cam: {
    readonly layers: readonly string[]; readonly paths: readonly unknown[];
    readonly operations: readonly unknown[];
    readonly bounds: { readonly minX: number; readonly minY: number; readonly maxX: number; readonly maxY: number };
  };
  readonly feedback: {
    snapshot(): readonly MobiViewFeedbackEventV1[];
    subscribe(listener: (event: MobiViewFeedbackEventV1) => void): () => void;
  };
  readonly transactions: {
    record(command: "INDUSTRIAL_VIEWED", projectId: string, referenceId: string): { readonly success: boolean; readonly transactionId?: string; readonly errorCode?: string };
  };
}
