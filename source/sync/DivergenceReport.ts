import type { Fingerprint } from "./Fingerprint";
import type { DivergenceReportSnapshot } from "./interfaces/SyncTypes";
import type { SyncState } from "./SyncState";

export class DivergenceReport {
  constructor(
    private readonly entity: string,
    private readonly source: string,
    private readonly destination: string,
    private readonly state: SyncState,
    private readonly sourceFingerprint: Fingerprint,
    private readonly destinationFingerprint: Fingerprint,
    private readonly logicalTimestamp: number,
    private readonly transactionId: string
  ) {}
  get(): DivergenceReportSnapshot {
    return {
      entity: this.entity, source: this.source, destination: this.destination, state: this.state,
      sourceFingerprint: this.sourceFingerprint.get(), destinationFingerprint: this.destinationFingerprint.get(),
      logicalTimestamp: this.logicalTimestamp, transactionId: this.transactionId
    };
  }
}
