import type { TransactionRequestSnapshot } from "../orchestrator/interfaces/OrchestratorTypes";
import type { TransactionLogSnapshot, TransactionResultSnapshot, TransactionStatus } from "./interfaces/TransactionTypes";

export class TransactionResult {
  constructor(
    private readonly request: TransactionRequestSnapshot,
    private readonly status: TransactionStatus,
    private readonly log: TransactionLogSnapshot,
    private readonly error?: string
  ) {}
  get(): TransactionResultSnapshot {
    const base = {
      transactionId: this.request.id,
      success: this.status === "COMMITTED",
      status: this.status,
      request: structuredClone(this.request),
      log: structuredClone(this.log)
    };
    return this.error === undefined ? base : { ...base, error: this.error };
  }
}
