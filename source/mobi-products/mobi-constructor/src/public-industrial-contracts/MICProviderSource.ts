export interface ProviderIndustrialOperation {
  readonly id: string;
  readonly sourcePartId: string;
  readonly kind: "PROFILE" | "EDGE";
  readonly parameters: Readonly<Record<string, number | string>>;
}

export interface ProviderManufacturingPart {
  readonly id: string;
  readonly sourceProductId: string;
  readonly operations: readonly ProviderIndustrialOperation[];
}

export interface ProviderManufacturingPackage {
  readonly projectId: string;
  readonly parts: readonly ProviderManufacturingPart[];
  readonly hardware: readonly unknown[];
}

export interface ProviderBOMLine {
  readonly kind: "MATERIAL" | "HARDWARE" | "COMPONENT";
  readonly key: string;
  readonly quantity: number;
  readonly areaMm2: number;
  readonly volumeMm3: number;
  readonly sourceIds: readonly string[];
}

export interface ProviderIndustrialOutput {
  readonly manufacturing: ProviderManufacturingPackage;
  readonly bom: {
    readonly projectId: string;
    readonly lines: readonly ProviderBOMLine[];
    readonly totals: {
      readonly partCount: number;
      readonly hardwareCount: number;
      readonly areaMm2: number;
      readonly volumeMm3: number;
    };
  };
  readonly exportTransactionId: string;
}

export interface ProviderClosedLoopOutput {
  readonly manufacturing: ProviderManufacturingPackage;
  readonly nesting: {
    readonly projectId: string;
    readonly placementCount: number;
    readonly sheets: readonly {
      readonly placements: readonly {
        readonly partId: string;
        readonly sheetId: string;
        readonly x: number;
        readonly y: number;
        readonly width: number;
        readonly height: number;
      }[];
    }[];
  };
  readonly cam: readonly {
    readonly format: "GENERIC_GCODE" | "DXF" | "NEUTRAL_CAM";
    readonly contractVersion: "1.0.0";
  }[];
  readonly feedback: {
    readonly logs: readonly {
      readonly id: string;
      readonly partId: string;
      readonly timestamp: number;
      readonly status: "STARTED" | "COMPLETED" | "REJECTED";
    }[];
    readonly telemetry: readonly {
      readonly id: string;
      readonly partId: string;
      readonly timestamp: number;
      readonly metric: string;
      readonly value: number;
      readonly unit: string;
    }[];
  };
  readonly verification: { readonly projectId: string };
}
