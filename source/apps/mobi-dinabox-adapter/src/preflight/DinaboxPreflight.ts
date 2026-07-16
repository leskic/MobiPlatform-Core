import type { DinaboxPreflightItem, DinaboxPreflightReport, DinaboxProjectInput } from "../interfaces/DinaboxAdapterTypes";
import { ExtractionPipeline } from "../pipeline/ExtractionPipeline";

export class DinaboxPreflight {
  private readonly extraction = new ExtractionPipeline();

  inspect(project: DinaboxProjectInput): DinaboxPreflightReport {
    const items: DinaboxPreflightItem[] = [];

    try {
      const extracted = this.extraction.execute(project);
      items.push({ code: "PROJECT_READABLE", message: "Dinabox project is readable", element: extracted.id, severity: "info" });

      if (extracted.modules.length === 0) items.push({ code: "NO_MODULES", message: "No modules supplied by Dinabox", element: extracted.id, severity: "warning" });
      if (extracted.materials.length === 0) items.push({ code: "NO_MATERIALS", message: "No materials supplied by Dinabox", element: extracted.id, severity: "warning" });
      for (const material of extracted.materials.filter(item => item.thickness === undefined)) items.push({ code: "MATERIAL_WITHOUT_THICKNESS", message: "Material thickness is not supplied", element: material.id, severity: "warning" });
      if (extracted.metadata.mobiConstructionDescriptor === undefined) items.push({ code: "MISSING_EXPLICIT_DESCRIPTOR", message: "Explicit Mobi construction descriptor is required", element: extracted.id, severity: "error" });

      return {
        checkpoint: "CP017-001",
        status: this.status(items),
        projectId: extracted.id,
        projectName: extracted.name,
        items,
        summary: {
          modules: extracted.modules.length,
          cabinets: extracted.cabinets.length,
          parts: extracted.parts.length,
          hardware: extracted.hardware.length,
          materials: extracted.materials.length,
          parameters: Object.keys(extracted.parameters).length,
          metadataKeys: Object.keys(extracted.metadata).length,
          warnings: items.filter(item => item.severity === "warning").length,
          errors: items.filter(item => item.severity === "error").length,
        },
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown Dinabox preflight error";
      items.push({ code: "PREFLIGHT_ERROR", message, element: project.id || "dinabox-project", severity: "error" });
      return {
        checkpoint: "CP017-001",
        status: "BLOCKED",
        projectId: project.id,
        projectName: project.name,
        items,
        summary: { modules: 0, cabinets: 0, parts: 0, hardware: 0, materials: 0, parameters: 0, metadataKeys: 0, warnings: 0, errors: 1 },
      };
    }
  }

  private status(items: readonly DinaboxPreflightItem[]): DinaboxPreflightReport["status"] {
    if (items.some(item => item.severity === "error")) return "BLOCKED";
    if (items.some(item => item.severity === "warning")) return "READY_WITH_WARNINGS";
    return "READY";
  }
}
