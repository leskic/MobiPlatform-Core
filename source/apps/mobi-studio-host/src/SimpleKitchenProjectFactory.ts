import { ProjectBuilder } from "../../../builder/ProjectBuilder";
import type { EdgeBanding, Project } from "../../../builder/types/ProjectTypes";
import type { NewProjectDraft } from "./NewProjectDraft";

const projectId = "9d0e6a20-12a2-4f5f-bd3a-000000000900";
const environmentId = "9d0e6a20-12a2-4f5f-bd3a-000000000901";
const wallA = "9d0e6a20-12a2-4f5f-bd3a-000000000911";
const baseModule = "9d0e6a20-12a2-4f5f-bd3a-000000000931";
const wallModule = "9d0e6a20-12a2-4f5f-bd3a-000000000932";
const towerModule = "9d0e6a20-12a2-4f5f-bd3a-000000000933";
const topModule = "9d0e6a20-12a2-4f5f-bd3a-000000000934";

export class SimpleKitchenProjectFactory {
  create(draft: NewProjectDraft): Project {
    const date = "2026-07-14T09:00:00-03:00";
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
      })
      .addEnvironment({
        id: environmentId,
        parentId: projectId,
        displayName: draft.environmentName,
        code: "AMB-001",
        order: 0,
        status: "validated",
      });

    this.addArchitecture(builder);
    this.addInfrastructure(builder);
    this.addModules(builder);
    return builder.build();
  }

  createJson(draft: NewProjectDraft): string {
    return JSON.stringify(this.create(draft), null, 2);
  }

  private addArchitecture(builder: ProjectBuilder): void {
    const walls = [
      { id: wallA, width: 3000, position: { x: 0, y: 0, z: 0 }, rotation: 0, referencePlane: { x: 0, y: 1, z: 0 } },
      { id: "9d0e6a20-12a2-4f5f-bd3a-000000000912", width: 3000, position: { x: 0, y: 2200, z: 0 }, rotation: 180, referencePlane: { x: 0, y: -1, z: 0 } },
      { id: "9d0e6a20-12a2-4f5f-bd3a-000000000913", width: 2200, position: { x: 0, y: 0, z: 0 }, rotation: 90, referencePlane: { x: 1, y: 0, z: 0 } },
      { id: "9d0e6a20-12a2-4f5f-bd3a-000000000914", width: 2200, position: { x: 3000, y: 0, z: 0 }, rotation: -90, referencePlane: { x: -1, y: 0, z: 0 } },
    ];

    for (const wall of walls) {
      builder.addArchitecture(environmentId, {
        id: wall.id,
        parentId: environmentId,
        type: "wall",
        hostId: null,
        size: { width: wall.width, height: 2700, depth: 150 },
        position: wall.position,
        rotation: { x: 0, y: 0, z: wall.rotation },
        referencePlane: wall.referencePlane,
        finish: "paint-white",
      });
    }

    builder.addArchitecture(environmentId, {
      id: "9d0e6a20-12a2-4f5f-bd3a-000000000915",
      parentId: environmentId,
      type: "opening",
      hostId: "9d0e6a20-12a2-4f5f-bd3a-000000000913",
      size: { width: 800, height: 2100, depth: 150 },
      position: { x: 100, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      referencePlane: { x: 1, y: 0, z: 0 },
      finish: "door-opening",
    });
  }

  private addInfrastructure(builder: ProjectBuilder): void {
    builder
      .addInfrastructure(environmentId, {
        id: "9d0e6a20-12a2-4f5f-bd3a-000000000921",
        parentId: environmentId,
        hostId: wallA,
        category: "electrical",
        type: "outlet-127v",
        position: { x: 900, y: 80, z: 1150 },
        installationVolume: { width: 120, height: 80, depth: 60 },
      })
      .addInfrastructure(environmentId, {
        id: "9d0e6a20-12a2-4f5f-bd3a-000000000922",
        parentId: environmentId,
        hostId: wallA,
        category: "water",
        type: "cold-water-point",
        position: { x: 1450, y: 80, z: 600 },
        installationVolume: { width: 100, height: 100, depth: 80 },
      })
      .addInfrastructure(environmentId, {
        id: "9d0e6a20-12a2-4f5f-bd3a-000000000923",
        parentId: environmentId,
        hostId: wallA,
        category: "sewer",
        type: "sink-drain",
        position: { x: 1450, y: 80, z: 250 },
        installationVolume: { width: 120, height: 120, depth: 120 },
      });
  }

  private addModules(builder: ProjectBuilder): void {
    builder
      .addModule(environmentId, { id: baseModule, parentId: environmentId, code: "MOD-INF-001", displayName: "Modulo inferior", type: "base", status: "validated", position: { x: 500, y: 150, z: 0 }, rotation: { x: 0, y: 0, z: 0 } })
      .addPart(baseModule, this.part("9d0e6a20-12a2-4f5f-bd3a-000000000941", baseModule, "structural", "side_panel", 720, 560, 15, "MDF-BRANCO-15"))
      .addPart(baseModule, this.part("9d0e6a20-12a2-4f5f-bd3a-000000000942", baseModule, "front", "door", 450, 700, 18, "MDF-CINZA-18"))
      .addHardware(baseModule, this.hardware("9d0e6a20-12a2-4f5f-bd3a-000000000951", baseModule, "9d0e6a20-12a2-4f5f-bd3a-000000000942", "hinge", "soft-close", "DOB-35-SC"))
      .addModule(environmentId, { id: wallModule, parentId: environmentId, code: "MOD-AER-001", displayName: "Modulo aereo", type: "wall", status: "validated", position: { x: 600, y: 150, z: 1450 }, rotation: { x: 0, y: 0, z: 0 } })
      .addPart(wallModule, this.part("9d0e6a20-12a2-4f5f-bd3a-000000000943", wallModule, "structural", "side_panel", 700, 320, 15, "MDF-BRANCO-15"))
      .addHardware(wallModule, this.hardware("9d0e6a20-12a2-4f5f-bd3a-000000000952", wallModule, "9d0e6a20-12a2-4f5f-bd3a-000000000943", "support", "wall-bracket", "SUP-AER-001"))
      .addModule(environmentId, { id: towerModule, parentId: environmentId, code: "MOD-TOR-001", displayName: "Torre", type: "tower", status: "validated", position: { x: 2200, y: 150, z: 0 }, rotation: { x: 0, y: 0, z: 0 } })
      .addPart(towerModule, this.part("9d0e6a20-12a2-4f5f-bd3a-000000000944", towerModule, "structural", "side_panel", 1400, 560, 15, "MDF-BRANCO-15"))
      .addHardware(towerModule, this.hardware("9d0e6a20-12a2-4f5f-bd3a-000000000953", towerModule, "9d0e6a20-12a2-4f5f-bd3a-000000000944", "connector", "dowel", "CAVILHA-8X30"))
      .addModule(environmentId, { id: topModule, parentId: environmentId, code: "MOD-TAM-001", displayName: "Tampo", type: "panel", status: "validated", position: { x: 500, y: 120, z: 730 }, rotation: { x: 0, y: 0, z: 0 } })
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

