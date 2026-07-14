import type {
  BridgeDirection,
  BridgeTransactionSnapshot
} from "./interfaces/BridgeTypes";

export class BridgeTransaction {
  constructor(
    private readonly id: string,
    private readonly sessionId: string,
    private readonly projectId: string,
    private readonly direction: BridgeDirection
  ) {
    if (id.trim().length === 0) throw new Error("Bridge transaction id cannot be empty");
  }

  get(): BridgeTransactionSnapshot {
    return {
      id: this.id,
      sessionId: this.sessionId,
      projectId: this.projectId,
      direction: this.direction,
      status: "prepared"
    };
  }
}
