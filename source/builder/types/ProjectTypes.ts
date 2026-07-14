export type Status = "draft" | "validated" | "production" | "archived";
export type Vector3 = { x: number; y: number; z: number };
export type Size3D = { width: number; height: number; depth: number };
export type Metadata = Record<string, unknown>;

export interface Project {
  id: string;
  displayName: string;
  code: string;
  schemaVersion: "1.0.0";
  measurementUnit: "mm";
  rotationUnit: "degrees";
  source: string;
  status: Status;
  createdAt: string;
  updatedAt: string;
  metadata?: Metadata;
  environments: Environment[];
}

export interface Environment {
  id: string;
  parentId: string;
  displayName: string;
  code: string;
  order: number;
  status: Status;
  architectures: Architecture[];
  infrastructures: Infrastructure[];
  modules: Module[];
}

export type ArchitectureType = "wall" | "floor" | "ceiling" | "opening";
export interface Architecture {
  id: string;
  parentId: string;
  type: ArchitectureType;
  hostId?: string | null;
  size: Size3D;
  position: Vector3;
  rotation: Vector3;
  referencePlane: Vector3;
  finish: string;
}

export type InfrastructureCategory = "electrical" | "water" | "sewer" | "gas" | "data" | "hvac";
export interface Infrastructure {
  id: string;
  parentId: string;
  hostId?: string | null;
  category: InfrastructureCategory;
  type: string;
  position: Vector3;
  installationVolume?: Size3D | null;
}

export type ModuleType = "base" | "wall" | "tower" | "island" | "panel" | "closet" | "office";
export interface Module {
  id: string;
  parentId: string;
  code: string;
  displayName: string;
  type: ModuleType;
  status: Status;
  position: Vector3;
  rotation: Vector3;
  parts: Part[];
  hardwares: Hardware[];
  metadata?: Metadata;
}

export type PartCategory = "structural" | "front" | "internal" | "finish";
export type PartType = "side_panel" | "door" | "drawer_front" | "shelf" | "back_panel" | "decorative";
export type GrainDirection = "lengthwise" | "crosswise" | "none";
export interface EdgeBand { applied: boolean; materialId?: string }
export interface EdgeBanding {
  top: EdgeBand;
  bottom: EdgeBand;
  left: EdgeBand;
  right: EdgeBand;
  front: EdgeBand;
  back: EdgeBand;
}
export interface Part {
  id: string;
  parentId: string;
  category: PartCategory;
  type: PartType;
  size: { width: number; height: number; thickness: number };
  position: Vector3;
  rotation: Vector3;
  materialId: string;
  edgeBanding: EdgeBanding;
  grainDirection: GrainDirection;
}

export type HardwareCategory = "hinge" | "slide" | "pull" | "connector" | "fastener" | "support" | "appliance" | "lighting" | "accessory";
export interface Hardware {
  id: string;
  parentId: string;
  hostId?: string | null;
  category: HardwareCategory;
  type: string;
  catalogId: string;
  position: Vector3;
  rotation: Vector3;
  metadata?: Metadata;
}

export type ProjectInput = Omit<Project, "schemaVersion" | "measurementUnit" | "rotationUnit" | "environments">;
export type EnvironmentInput = Omit<Environment, "architectures" | "infrastructures" | "modules">;
export type ModuleInput = Omit<Module, "parts" | "hardwares">;
