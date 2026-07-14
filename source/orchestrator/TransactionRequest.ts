import type { DivergenceReportSnapshot } from "../sync/interfaces/SyncTypes";
import type { TransactionRequestSnapshot } from "./interfaces/OrchestratorTypes";
import type { ResolutionStrategy } from "./ResolutionStrategy";

export class TransactionRequest {
  constructor(private readonly report: DivergenceReportSnapshot, private readonly strategy: ResolutionStrategy) {}
  get(): TransactionRequestSnapshot {
    return {
      id: this.report.transactionId, entity: this.report.entity,
      source: this.report.source, destination: this.report.destination,
      strategy: this.strategy, status: "PREPARED", logicalTimestamp: this.report.logicalTimestamp,
      sourceFingerprint: this.report.sourceFingerprint.value,
      destinationFingerprint: this.report.destinationFingerprint.value
    };
  }
}
