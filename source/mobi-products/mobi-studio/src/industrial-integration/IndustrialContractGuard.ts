import {
  MIC_VERSION,
  type IndustrialContractSnapshot,
} from "./IndustrialContracts";

export class IndustrialContractGuard {
  validate(
    candidate: IndustrialContractSnapshot | null | undefined,
  ): IndustrialContractSnapshot {
    if (!candidate || typeof candidate !== "object") {
      throw new Error("INDUSTRIAL_SNAPSHOT_REQUIRED");
    }

    const { manifest, bom, cam, feedback, transactions } = candidate;
    if (
      !manifest ||
      !bom ||
      !cam ||
      !feedback ||
      !transactions ||
      typeof feedback.snapshot !== "function" ||
      typeof feedback.subscribe !== "function" ||
      typeof transactions.record !== "function"
    ) {
      throw new Error("INDUSTRIAL_CONTRACT_INVALID");
    }

    if (
      manifest.version !== MIC_VERSION ||
      bom.version !== MIC_VERSION ||
      cam.version !== MIC_VERSION
    ) {
      throw new Error("MIC_VERSION_INCOMPATIBLE");
    }

    if (!manifest.projectId.trim()) {
      throw new Error("INDUSTRIAL_PROJECT_ID_INVALID");
    }
    if (
      bom.projectId !== manifest.projectId ||
      cam.projectId !== manifest.projectId
    ) {
      throw new Error("INDUSTRIAL_PROJECT_ID_MISMATCH");
    }

    return candidate;
  }
}
