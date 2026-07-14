import type { TransactionRequestSnapshot } from "../orchestrator/interfaces/OrchestratorTypes";
import { TransactionEvent } from "./TransactionEvent";
import type { TransactionEventSnapshot, TransactionState } from "./interfaces/TransactionTypes";

export class Transaction {
  private state: TransactionState = "BEGIN";
  private readonly events: TransactionEventSnapshot[] = [];
  constructor(readonly request: TransactionRequestSnapshot) { this.record("BEGIN"); }
  transition(state: TransactionState): void { this.state = state; this.record(state); }
  getState(): TransactionState { return this.state; }
  getEvents(): TransactionEventSnapshot[] { return structuredClone(this.events); }
  private record(state: TransactionState): void {
    this.events.push(new TransactionEvent(this.request.id, state, this.request.logicalTimestamp).get());
  }
}
