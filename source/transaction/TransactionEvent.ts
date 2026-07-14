import type { TransactionEventSnapshot, TransactionState } from "./interfaces/TransactionTypes";

export class TransactionEvent {
  constructor(
    private readonly transactionId: string,
    private readonly state: TransactionState,
    private readonly logicalTimestamp: number
  ) {}
  get(): TransactionEventSnapshot {
    return { transactionId: this.transactionId, state: this.state, logicalTimestamp: this.logicalTimestamp };
  }
}
