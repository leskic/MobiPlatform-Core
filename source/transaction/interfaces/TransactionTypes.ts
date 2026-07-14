import type { MobiOrigin } from "../../origin/MobiOrigin";
import type { TransactionRequestSnapshot } from "../../orchestrator/interfaces/OrchestratorTypes";

export type TransactionState = "BEGIN" | "VALIDATE" | "EXECUTE" | "COMMIT" | "ROLLBACK" | "FINISH";
export type TransactionStatus = "COMMITTED" | "ROLLED_BACK";
export type TransactionOperation = (origin: MobiOrigin) => void;
export interface TransactionContextInput {
  author: string;
  operationName: string;
  operation: TransactionOperation;
}
export interface TransactionEventSnapshot {
  transactionId: string;
  state: TransactionState;
  logicalTimestamp: number;
}
export interface TransactionLogSnapshot {
  transactionId: string;
  logicalTimestamp: number;
  source: string;
  author: string;
  state: TransactionState;
  operations: string[];
  result: TransactionStatus;
  rollbackExecuted: boolean;
  events: TransactionEventSnapshot[];
}
export interface TransactionResultSnapshot {
  transactionId: string;
  success: boolean;
  status: TransactionStatus;
  request: TransactionRequestSnapshot;
  log: TransactionLogSnapshot;
  error?: string;
}
