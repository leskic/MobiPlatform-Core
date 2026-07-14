import {
  MIC_VERSION,
  type IndustrialTransactionCommand,
  type IndustrialTransactionCoordinatorPort,
  type IndustrialTransactionPort,
  type IndustrialTransactionResult,
  type PublicTransactionCommand,
} from "./MICContracts";

const preview = { apply: () => {}, revert: () => {} };

export class IndustrialTransactionAdapter implements IndustrialTransactionPort {
  private sequence = 0;

  constructor(private readonly coordinator: IndustrialTransactionCoordinatorPort) {}

  record(
    command: IndustrialTransactionCommand,
    projectId: string,
    referenceId: string,
  ): IndustrialTransactionResult {
    if (!projectId.trim() || !referenceId.trim()) {
      return { success: false, errorCode: "INVALID_INDUSTRIAL_TRANSACTION" };
    }
    const request: PublicTransactionCommand = {
      id: `mic:${command}:${projectId}:${this.sequence}`,
      entityId: projectId,
      property: "industrialEvent",
      value: { command, referenceId, micVersion: MIC_VERSION },
      author: "mobi-constructor",
      logicalTimestamp: this.sequence++,
      operationName: command,
      operation: () => {},
      preview,
    };
    return structuredClone(this.coordinator.execute(request));
  }
}
