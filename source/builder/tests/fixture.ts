import type {
  Architecture, EnvironmentInput, Hardware, Infrastructure, ModuleInput,
  Part, ProjectInput
} from "../types/ProjectTypes";

export const ids = {
  project: "123e4567-e89b-42d3-a456-426614174000",
  environment: "123e4567-e89b-42d3-a456-426614174001",
  architecture: "123e4567-e89b-42d3-a456-426614174002",
  infrastructure: "123e4567-e89b-42d3-a456-426614174003",
  module: "123e4567-e89b-42d3-a456-426614174004",
  part: "123e4567-e89b-42d3-a456-426614174005",
  hardware: "123e4567-e89b-42d3-a456-426614174006"
} as const;

export const projectInput: ProjectInput = {
  id: ids.project, displayName: "Projeto Builder", code: "PRJ-001",
  source: "builder-test", status: "draft",
  createdAt: "2026-07-12T20:00:00-03:00", updatedAt: "2026-07-12T20:00:00-03:00"
};
export const environmentInput: EnvironmentInput = {
  id: ids.environment, parentId: ids.project, displayName: "Cozinha",
  code: "AMB-001", order: 0, status: "draft"
};
export const architectureInput: Architecture = {
  id: ids.architecture, parentId: ids.environment, type: "wall", hostId: null,
  size: { width: 3200, height: 2700, depth: 150 }, position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 }, referencePlane: { x: 0, y: 0, z: 0 }, finish: "paint"
};
export const infrastructureInput: Infrastructure = {
  id: ids.infrastructure, parentId: ids.environment, category: "electrical", type: "outlet",
  hostId: ids.architecture,
  position: { x: 600, y: 300, z: 0 }, installationVolume: null
};
export const moduleInput: ModuleInput = {
  id: ids.module, parentId: ids.environment, code: "MOD-001", displayName: "Balcão",
  type: "base", status: "draft", position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }
};
export const partInput: Part = {
  id: ids.part, parentId: ids.module, category: "structural", type: "side_panel",
  size: { width: 720, height: 560, thickness: 15 }, position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 }, materialId: "MDF-15",
  edgeBanding: {
    top: { applied: false }, bottom: { applied: false }, left: { applied: false },
    right: { applied: false }, front: { applied: true, materialId: "FITA-1" }, back: { applied: false }
  },
  grainDirection: "lengthwise"
};
export const hardwareInput: Hardware = {
  id: ids.hardware, parentId: ids.module, hostId: ids.part, category: "connector",
  type: "dowel", catalogId: "CAVILHA-8X30", position: { x: 30, y: 30, z: 7.5 },
  rotation: { x: 0, y: 0, z: 0 }
};
