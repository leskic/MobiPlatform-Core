import { ProjectBuilder } from "../../../builder/ProjectBuilder";
import type { EdgeBanding, Project } from "../../../builder/types/ProjectTypes";
import type { NewProjectDraft } from "./NewProjectDraft";
import { emptyDoorEditorState, type DoorEditorState } from "./doors/DoorModel";
import { DoorSerializer } from "./doors/DoorSerializer";
import { emptyEnvironmentEditorState, type EnvironmentEditorState } from "./environments/EnvironmentModel";
import { defaultFourWallState, type WallEditorState } from "./walls/WallModel";
import { WallSerializer } from "./walls/WallSerializer";

const projectId = "9d0e6a20-12a2-4f5f-bd3a-000000000900";
const environmentId = "9d0e6a20-12a2-4f5f-bd3a-000000000901";
const wallA = "9d0e6a20-12a2-4f5f-bd3a-000000000911";
const baseModule = "9d0e6a20-12a2-4f5f-bd3a-000000000931";
const wallModule = "9d0e6a20-12a2-4f5f-bd3a-000000000932";
const towerModule = "9d0e6a20-12a2-4f5f-bd3a-000000000933";
const topModule = "9d0e6a20-12a2-4f5f-bd3a-000000000934";

export class SimpleKitchenProjectFactory {
  constructor(private readonly wallSerializer = new WallSerializer(), private readonly doorSerializer = new DoorSerializer()) {}

  create(
    draft: NewProjectDraft,
    wallState: WallEditorState = defaultFourWallState(),
    doorState: DoorEditorState = emptyDoorEditorState(),
    environmentState: EnvironmentEditorState = emptyEnvironmentEditorState(),
  ): Project {
    const date = "2026-07-14T09:00:00-03:00";
    const environments = environmentState.environments.length > 0
      ? environmentState.environments
      : [{ id: environmentId, name: draft.environmentName }];
    const builder = new ProjectBuilder()
      .createProject({
        id: projectId,
        displayName: draft.projectName,
        code: draft.projectCode,
        source: "mobi-studio-host-new-project",
        status: "validated",
        createdAt: date,
        updatedAt: date,
        metadata: {
          client: draft.clientName,
          preset: "cozinha-simples",
          createdBy: "Mobi Studio Host",
        },
      });

    environments.forEach((environment, index) => {
      builder.addEnvironment({
        id: environmentIdFor(index, environment.id),
        parentId: projectId,
        displayName: environment.name,
        code: `AMB-${String(index + 1).padStart(3, "0")}`,
        order: index,
        status: "validated",
      });
    });

    const primaryEnvironmentId = environmentIdFor(0, environments[0]?.id ?? environmentId);
    this.addArchitecture(builder, primaryEnvironmentId, wallState, doorState);
    this.addInfrastructure(builder, primaryEnvironmentId);
    this.addModules(builder, primaryEnvironmentId);
    return builder.build();
  }

  createJson(
    draft: NewProjectDraft,
    wallState: WallEditorState = defaultFourWallState(),
    doorState: DoorEditorState = emptyDoorEditorState(),
    environmentState: EnvironmentEditorState = emptyEnvironmentEditorState(),
  ): string {
    return JSON.stringify(this.create(draft, wallState, doorState, environmentState), null, 2);
  }

  private addArchitecture(builder: ProjectBuilder, targetEnvironmentId: string, wallState: WallEditorState, doorState: DoorEditorState): void {
    for (const wall of this.wallSerializer.toArchitectures(wallState, targetEnvironmentId)) {
      builder.addArchitecture(targetEnvironmentId, wall);
    }
    for (const door of this.doorSerializer.toArchitectures(doorState, wallState, targetEnvironmentId, this.wallSerializer.architectureIdByWall(wallState))) {
      builder.addArchitecture(targetEnvironmentId, door);
    }
  }

  private addInfrastructure(builder: ProjectBuilder, targetEnvironmentId: string): void {
    builder
      .addInfrastructure(targetEnvironmentId, {
        id: "9d0e6a20-12a2-4f5f-bd3a-000000000921",
        parentId: targetEnvironmentId,
        hostId: wallA,
        category: "electrical",
        type: "outlet-127v",
        position: { x: 900, y: 80, z: 1150 },
        installationVolume: { width: 120, height: 80, depth: 60 },
      })
      .addInfrastructure(targetEnvironmentId, {
        id: "9d0e6a20-12a2-4f5f-bd3a-000000000922",
        parentId: targetEnvironmentId,
        hostId: wallA,
        category: "water",
        type: "cold-water-point",
        position: { x: 1450, y: 80, z: 600 },
        installationVolume: { width: 100, height: 100, depth: 80 },
      })
      .addInfrastructure(targetEnvironmentId, {
        id: "9d0e6a20-12a2-4f5f-bd3a-000000000923",
        parentId: targetEnvironmentId,
        hostId: wallA,
        category: "sewer",
        type: "sink-drain",
        position: { x: 1450, y: 80, z: 250 },
        installationVolume: { width: 120, height: 120, depth: 120 },
      });
  }

  private addModules(builder: ProjectBuilder, targetEnvironmentId: string): void {
    builder
      .addModule(targetEnvironmentId, { id: baseModule, parentId: targetEnvironmentId, code: "MOD-INF-001", displayName: "Modulo inferior", type: "base", status: "validated", position: { x: 500, y: 150, z: 0 }, rotation: { x: 0, y: 0, z: 0 } })
      .addPart(baseModule, this.part("9d0e6a20-12a2-4f5f-bd3a-000000000941", baseModule, "structural", "side_panel", 720, 560, 15, "MDF-BRANCO-15"))
      .addPart(baseModule, this.part("9d0e6a20-12a2-4f5f-bd3a-000000000942", baseModule, "front", "door", 450, 700, 18, "MDF-CINZA-18"))
      .addHardware(baseModule, this.hardware("9d0e6a20-12a2-4f5f-bd3a-000000000951", baseModule, "9d0e6a20-12a2-4f5f-bd3a-000000000942", "hinge", "soft-close", "DOB-35-SC"))
      .addModule(targetEnvironmentId, { id: wallModule, parentId: targetEnvironmentId, code: "MOD-AER-001", displayName: "Modulo aereo", type: "wall", status: "validated", position: { x: 600, y: 150, z: 1450 }, rotation: { x: 0, y: 0, z: 0 } })
      .addPart(wallModule, this.part("9d0e6a20-12a2-4f5f-bd3a-000000000943", wallModule, "structural", "side_panel", 700, 320, 15, "MDF-BRANCO-15"))
      .addHardware(wallModule, this.hardware("9d0e6a20-12a2-4f5f-bd3a-000000000952", wallModule, "9d0e6a20-12a2-4f5f-bd3a-000000000943", "support", "wall-bracket", "SUP-AER-001"))
      .addModule(targetEnvironmentId, { id: towerModule, parentId: targetEnvironmentId, code: "MOD-TOR-001", displayName: "Torre", type: "tower", status: "validated", position: { x: 2200, y: 150, z: 0 }, rotation: { x: 0, y: 0, z: 0 } })
      .addPart(towerModule, this.part("9d0e6a20-12a2-4f5f-bd3a-000000000944", towerModule, "structural", "side_panel", 1400, 560, 15, "MDF-BRANCO-15"))
      .addHardware(towerModule, this.hardware("9d0e6a20-12a2-4f5f-bd3a-000000000953", towerModule, "9d0e6a20-12a2-4f5f-bd3a-000000000944", "connector", "dowel", "CAVILHA-8X30"))
      .addModule(targetEnvironmentId, { id: topModule, parentId: targetEnvironmentId, code: "MOD-TAM-001", displayName: "Tampo", type: "panel", status: "validated", position: { x: 500, y: 120, z: 730 }, rotation: { x: 0, y: 0, z: 0 } })
      .addPart(topModule, this.part("9d0e6a20-12a2-4f5f-bd3a-000000000945", topModule, "finish", "decorative", 1400, 600, 30, "TAMPO-QUARTZO-30"))
      .addHardware(topModule, this.hardware("9d0e6a20-12a2-4f5f-bd3a-000000000954", topModule, "9d0e6a20-12a2-4f5f-bd3a-000000000945", "fastener", "countertop-bracket", "SUP-TAMPO-001"));
  }

  private part(id: string, parentId: string, category: "structural" | "front" | "finish", type: "side_panel" | "door" | "decorative", width: number, height: number, thickness: number, materialId: string) {
    return {
      id,
      parentId,
      category,
      type,
      size: { width, height, thickness },
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      materialId,
      edgeBanding: edgeBanding(),
      grainDirection: type === "decorative" ? "none" as const : "lengthwise" as const,
    };
  }

  private hardware(id: string, parentId: string, hostId: string, category: "hinge" | "support" | "connector" | "fastener", type: string, catalogId: string) {
    return {
      id,
      parentId,
      hostId,
      category,
      type,
      catalogId,
      position: { x: 30, y: 30, z: 30 },
      rotation: { x: 0, y: 0, z: 0 },
    };
  }
}

function edgeBanding(): EdgeBanding {
  return {
    top: { applied: true, materialId: "FITA-BRANCA-1" },
    bottom: { applied: false },
    left: { applied: true, materialId: "FITA-BRANCA-1" },
    right: { applied: true, materialId: "FITA-BRANCA-1" },
    front: { applied: true, materialId: "FITA-BRANCA-1" },
    back: { applied: false },
  };
}

function environmentIdFor(index: number, id: string): string {
  if (id.includes("-") && id.length === 36) return id;
  if (index === 0) return environmentId;
  return `9d0e6a20-12a2-4f5f-bd3a-${String(1000 + index).padStart(12, "0")}`;
}
