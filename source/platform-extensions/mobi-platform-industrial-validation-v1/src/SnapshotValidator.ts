import {
  MIC_VERSION,
  type IndustrialContractSnapshot,
  type ProductionFeedbackEvent,
} from "../../../mobi-products/mobi-constructor/src/index";
import { FlowDiagnostics } from "./FlowDiagnostics";

export class SnapshotValidator {
  validate(snapshot: IndustrialContractSnapshot | null | undefined): FlowDiagnostics {
    const diagnostics = new FlowDiagnostics();
    if (!snapshot) {
      diagnostics.error("CONSISTENCY", "SNAPSHOT_REQUIRED", "Industrial snapshot is required");
      return diagnostics;
    }
    this.validateManifest(snapshot, diagnostics);
    this.validateBom(snapshot, diagnostics);
    this.validateCam(snapshot, diagnostics);
    this.validateFeedback(snapshot, diagnostics);
    this.validateTransactions(snapshot, diagnostics);
    return diagnostics;
  }

  private validateManifest(snapshot: IndustrialContractSnapshot, diagnostics: FlowDiagnostics): void {
    const manifest = snapshot.manifest;
    if (manifest.contract !== "mobi.production-manifest") diagnostics.error("MANIFEST", "MANIFEST_CONTRACT_INVALID", "Invalid manifest contract");
    if (manifest.version !== MIC_VERSION) diagnostics.error("MANIFEST", "MANIFEST_MIC_VERSION_INVALID", "Manifest MIC version is invalid");
    if (!manifest.projectId.trim()) diagnostics.error("MANIFEST", "MANIFEST_PROJECT_ID_REQUIRED", "Manifest projectId is required");
    if (!manifest.exportId.trim()) diagnostics.error("MANIFEST", "MANIFEST_EXPORT_ID_REQUIRED", "Manifest exportId is required");
    if (manifest.state !== "COMPLETED" || manifest.progress !== 100) diagnostics.error("MANIFEST", "MANIFEST_NOT_COMPLETED", "Manifest must be completed with 100 progress");
    if (manifest.indicators.partCount !== manifest.parts.length) diagnostics.error("MANIFEST", "MANIFEST_PART_COUNT_MISMATCH", "Manifest partCount must match parts length");
    for (const part of manifest.parts) {
      if (!part.partId.trim() || !part.manufacturingId.trim() || !part.sourceEntityId.trim()) {
        diagnostics.error("MANIFEST", "MANIFEST_PART_ID_INVALID", "Manifest part relation ids must be non-empty", part.partId);
      }
    }
  }

  private validateBom(snapshot: IndustrialContractSnapshot, diagnostics: FlowDiagnostics): void {
    const bom = snapshot.bom;
    if (bom.contract !== "mobi.bom-output") diagnostics.error("BOM", "BOM_CONTRACT_INVALID", "Invalid BOM contract");
    if (bom.version !== MIC_VERSION) diagnostics.error("BOM", "BOM_MIC_VERSION_INVALID", "BOM MIC version is invalid");
    if (bom.projectId !== snapshot.manifest.projectId) diagnostics.error("BOM", "BOM_PROJECT_ID_MISMATCH", "BOM projectId must match manifest projectId");
    if (bom.totals.partCount !== snapshot.manifest.indicators.partCount) diagnostics.warning("BOM", "BOM_PART_TOTAL_MISMATCH", "BOM part total differs from manifest part count");
    for (const line of bom.lines) {
      if (!line.id.trim() || !line.key.trim()) diagnostics.error("BOM", "BOM_LINE_ID_INVALID", "BOM line id and key are required", line.id);
      if (line.quantity <= 0) diagnostics.error("BOM", "BOM_LINE_QUANTITY_INVALID", "BOM line quantity must be positive", line.id);
      if (line.areaMm2 < 0 || line.volumeMm3 < 0) diagnostics.error("BOM", "BOM_LINE_MEASURE_INVALID", "BOM line measures cannot be negative", line.id);
      if (!line.sourceEntityIds.length) diagnostics.error("BOM", "BOM_LINE_SOURCE_REQUIRED", "BOM line must reference source entities", line.id);
    }
  }

  private validateCam(snapshot: IndustrialContractSnapshot, diagnostics: FlowDiagnostics): void {
    const cam = snapshot.cam;
    if (cam.contract !== "mobi.neutral-cam-package") diagnostics.error("CAM", "CAM_CONTRACT_INVALID", "Invalid CAM contract");
    if (cam.version !== MIC_VERSION) diagnostics.error("CAM", "CAM_MIC_VERSION_INVALID", "CAM MIC version is invalid");
    if (cam.projectId !== snapshot.manifest.projectId) diagnostics.error("CAM", "CAM_PROJECT_ID_MISMATCH", "CAM projectId must match manifest projectId");
    if (!cam.layers.includes("CUT_OUTLINE")) diagnostics.error("CAM", "CAM_LAYER_REQUIRED", "CUT_OUTLINE layer is required");
    if (!this.validBounds(cam.bounds)) diagnostics.error("CAM", "CAM_BOUNDS_INVALID", "CAM package bounds are invalid");
    for (const path of cam.paths) {
      if (!path.id.trim() || !path.partId.trim() || !path.entityId.trim()) diagnostics.error("CAM", "CAM_PATH_ID_INVALID", "CAM path ids are required", path.id);
      if (!path.closed) diagnostics.error("CAM", "CAM_PATH_NOT_CLOSED", "CAM path must be closed", path.id);
      if (path.points.length < 2) diagnostics.error("CAM", "CAM_PATH_POINTS_INVALID", "CAM path requires points", path.id);
      if (!this.validBounds(path.bounds)) diagnostics.error("CAM", "CAM_PATH_BOUNDS_INVALID", "CAM path bounds are invalid", path.id);
    }
    const pathIds = new Set(cam.paths.map((path) => path.id));
    for (const operation of cam.operations) {
      if (!operation.id.trim() || !operation.partId.trim() || !operation.entityId.trim()) diagnostics.error("CAM", "CAM_OPERATION_ID_INVALID", "CAM operation ids are required", operation.id);
      if (!pathIds.has(operation.pathId)) diagnostics.error("CAM", "CAM_OPERATION_PATH_MISSING", "CAM operation must reference an existing path", operation.id);
    }
  }

  private validateFeedback(snapshot: IndustrialContractSnapshot, diagnostics: FlowDiagnostics): void {
    if (typeof snapshot.feedback.snapshot !== "function" || typeof snapshot.feedback.subscribe !== "function") {
      diagnostics.error("FEEDBACK", "FEEDBACK_STREAM_INVALID", "Feedback stream must expose snapshot and subscribe");
      return;
    }
    for (const event of snapshot.feedback.snapshot()) this.validateFeedbackEvent(event, snapshot.manifest.projectId, diagnostics);
  }

  private validateFeedbackEvent(event: ProductionFeedbackEvent, projectId: string, diagnostics: FlowDiagnostics): void {
    if (event.contract !== "mobi.production-feedback-event") diagnostics.error("FEEDBACK", "FEEDBACK_CONTRACT_INVALID", "Invalid feedback event contract", event.eventId);
    if (event.version !== MIC_VERSION) diagnostics.error("FEEDBACK", "FEEDBACK_MIC_VERSION_INVALID", "Feedback event MIC version is invalid", event.eventId);
    if (event.projectId !== projectId) diagnostics.error("FEEDBACK", "FEEDBACK_PROJECT_ID_MISMATCH", "Feedback projectId must match manifest projectId", event.eventId);
    if (!event.eventId.trim() || !event.partId.trim()) diagnostics.error("FEEDBACK", "FEEDBACK_ID_INVALID", "Feedback event id and partId are required", event.eventId);
    if (event.logicalTimestamp < 0) diagnostics.error("FEEDBACK", "FEEDBACK_TIMESTAMP_INVALID", "Feedback timestamp cannot be negative", event.eventId);
    if (event.status === "TELEMETRY" && !event.telemetry) diagnostics.error("FEEDBACK", "FEEDBACK_TELEMETRY_REQUIRED", "Telemetry event requires telemetry payload", event.eventId);
  }

  private validateTransactions(snapshot: IndustrialContractSnapshot, diagnostics: FlowDiagnostics): void {
    if (typeof snapshot.transactions.record !== "function") {
      diagnostics.error("TRANSACTIONS", "TRANSACTIONS_PORT_INVALID", "Transactions port must expose record");
      return;
    }
    diagnostics.info("TRANSACTIONS", "TRANSACTIONS_PORT_AVAILABLE", "Transactions port is available");
  }

  private validBounds(bounds: { readonly minX: number; readonly minY: number; readonly maxX: number; readonly maxY: number }): boolean {
    return [bounds.minX, bounds.minY, bounds.maxX, bounds.maxY].every(Number.isFinite) && bounds.maxX >= bounds.minX && bounds.maxY >= bounds.minY;
  }
}
