import type { IndustrialContractSnapshot } from "../../../mobi-products/mobi-constructor/src/index";
import { FlowDiagnostics } from "./FlowDiagnostics";

export class ProductionConsistencyValidator {
  validate(snapshot: IndustrialContractSnapshot | null | undefined): FlowDiagnostics {
    const diagnostics = new FlowDiagnostics();
    if (!snapshot) return diagnostics;

    const manifestPartIds = new Set(snapshot.manifest.parts.map((part) => part.partId));
    const manifestEntityIds = new Set(snapshot.manifest.parts.map((part) => part.sourceEntityId));
    const bomEntityIds = new Set(snapshot.bom.lines.flatMap((line) => line.sourceEntityIds));
    const camPartIds = new Set(snapshot.cam.paths.map((path) => path.partId));
    const operationPartIds = new Set(snapshot.cam.operations.map((operation) => operation.partId));
    const feedbackPartIds = new Set(snapshot.feedback.snapshot().map((event) => event.partId));

    for (const entityId of bomEntityIds) {
      if (!manifestEntityIds.has(entityId)) diagnostics.warning("CONSISTENCY", "BOM_SOURCE_NOT_IN_MANIFEST", "BOM source entity is not listed as a manifest part source", entityId);
    }
    for (const partId of camPartIds) {
      if (!manifestPartIds.has(partId)) diagnostics.error("CONSISTENCY", "CAM_PART_NOT_IN_MANIFEST", "CAM path part is absent from manifest", partId);
    }
    for (const partId of operationPartIds) {
      if (!manifestPartIds.has(partId)) diagnostics.error("CONSISTENCY", "CAM_OPERATION_PART_NOT_IN_MANIFEST", "CAM operation part is absent from manifest", partId);
    }
    for (const partId of feedbackPartIds) {
      if (!manifestPartIds.has(partId)) diagnostics.error("CONSISTENCY", "FEEDBACK_PART_NOT_IN_MANIFEST", "Feedback part is absent from manifest", partId);
    }
    if (snapshot.manifest.indicators.operationCount !== snapshot.cam.operations.length) {
      diagnostics.warning("CONSISTENCY", "OPERATION_COUNT_DIVERGENCE", "Manifest operation count differs from CAM operations length");
    }
    if (diagnostics.valid) diagnostics.info("CONSISTENCY", "INDUSTRIAL_CHAIN_CONSISTENT", "Industrial snapshot is internally consistent");
    return diagnostics;
  }
}
