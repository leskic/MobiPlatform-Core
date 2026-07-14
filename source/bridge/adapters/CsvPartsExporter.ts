import type { EdgeBand, Part } from "../../builder/types/ProjectTypes";
import type { MobiOrigin } from "../../origin/MobiOrigin";
import type { BridgeExportAdapter } from "./AdapterRegistry";

const HEADERS = [
  "environmentId", "moduleId", "id", "parentId", "category", "type",
  "width", "height", "thickness", "positionX", "positionY", "positionZ",
  "rotationX", "rotationY", "rotationZ", "materialId", "grainDirection",
  "edgeTopApplied", "edgeTopMaterialId", "edgeBottomApplied", "edgeBottomMaterialId",
  "edgeLeftApplied", "edgeLeftMaterialId", "edgeRightApplied", "edgeRightMaterialId",
  "edgeFrontApplied", "edgeFrontMaterialId", "edgeBackApplied", "edgeBackMaterialId"
] as const;

function cell(value: string | number | boolean | undefined): string {
  if (value === undefined) return "";
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function edgeCells(edge: EdgeBand): Array<string | boolean | undefined> {
  return [edge.applied, edge.materialId];
}

function partCells(environmentId: string, moduleId: string, part: Part): Array<string | number | boolean | undefined> {
  return [
    environmentId, moduleId, part.id, part.parentId, part.category, part.type,
    part.size.width, part.size.height, part.size.thickness,
    part.position.x, part.position.y, part.position.z,
    part.rotation.x, part.rotation.y, part.rotation.z,
    part.materialId, part.grainDirection,
    ...edgeCells(part.edgeBanding.top), ...edgeCells(part.edgeBanding.bottom),
    ...edgeCells(part.edgeBanding.left), ...edgeCells(part.edgeBanding.right),
    ...edgeCells(part.edgeBanding.front), ...edgeCells(part.edgeBanding.back)
  ];
}

export class CsvPartsExporter implements BridgeExportAdapter {
  readonly id = "csv-parts";

  constructor(private readonly origin: MobiOrigin) {}

  export(): string {
    const project = this.origin.getProject();
    const rows = project.environments.flatMap((environment) =>
      environment.modules.flatMap((module) =>
        module.parts.map((part) => partCells(environment.id, module.id, part))
      )
    );
    return [HEADERS, ...rows].map((row) => row.map(cell).join(",")).join("\n");
  }
}
