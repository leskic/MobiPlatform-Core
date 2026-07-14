import type { IndustrialContractSnapshot } from "../../../mobi-products/mobi-constructor/src/index";
import type { MobiViewSnapshot } from "../../../mobi-products/mobi-view/src/index";
import { validate } from "../../../validator/SchemaValidator";
import type { ProjectMobiEnvelopeV1 } from "../../mobi-platform-chain-v1/src/index";

export class FlowValidation {
  validateProjectPayload(payload: string): void {
    const parsed = this.parse(payload);
    const result = validate(parsed);
    if (!result.valid) throw new Error("FLOW_SCHEMA_VALIDATION_FAILED");
  }

  validateEnvelope(envelope: ProjectMobiEnvelopeV1): void {
    if (envelope.contract !== "mobi.project-envelope" || envelope.mediaType !== "application/vnd.mobi.project+json") {
      throw new Error("FLOW_PROJECT_ENVELOPE_INVALID");
    }
    this.validateProjectPayload(envelope.payload);
  }

  validateIndustrialSnapshot(snapshot: IndustrialContractSnapshot, projectId: string): void {
    if (snapshot.manifest.projectId !== projectId || snapshot.bom.projectId !== projectId || snapshot.cam.projectId !== projectId) {
      throw new Error("FLOW_INDUSTRIAL_SNAPSHOT_PROJECT_MISMATCH");
    }
    if (!snapshot.feedback || !snapshot.transactions) throw new Error("FLOW_INDUSTRIAL_SNAPSHOT_INVALID");
  }

  validateView(snapshot: MobiViewSnapshot, projectId: string): void {
    if (snapshot.projectId !== projectId) throw new Error("FLOW_VIEW_PROJECT_MISMATCH");
    if (snapshot.production.progress !== 100) throw new Error("FLOW_VIEW_PROGRESS_INVALID");
  }

  private parse(payload: string): unknown {
    try {
      return JSON.parse(payload) as unknown;
    } catch {
      throw new Error("FLOW_PROJECT_JSON_INVALID");
    }
  }
}
