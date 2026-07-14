import type { BridgeEventSnapshot, BridgeEventType } from "./interfaces/BridgeTypes";

export class BridgeEvent {
  constructor(
    private readonly type: BridgeEventType,
    private readonly sessionId: string,
    private readonly transactionId?: string
  ) {}

  get(): BridgeEventSnapshot {
    return this.transactionId === undefined
      ? { type: this.type, sessionId: this.sessionId }
      : { type: this.type, sessionId: this.sessionId, transactionId: this.transactionId };
  }
}
