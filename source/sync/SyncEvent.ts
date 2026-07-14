import type { SyncEventSnapshot, SyncEventType } from "./interfaces/SyncTypes";

export class SyncEvent {
  constructor(
    readonly type: SyncEventType,
    readonly entity: string,
    readonly transactionId: string,
    readonly logicalTimestamp: number
  ) {
    if (transactionId.trim().length === 0) throw new Error("Sync transaction id cannot be empty");
    if (!Number.isSafeInteger(logicalTimestamp) || logicalTimestamp < 0) {
      throw new Error("Logical timestamp must be a non-negative safe integer");
    }
  }
  get(): SyncEventSnapshot {
    return { type: this.type, entity: this.entity, transactionId: this.transactionId, logicalTimestamp: this.logicalTimestamp };
  }
}
