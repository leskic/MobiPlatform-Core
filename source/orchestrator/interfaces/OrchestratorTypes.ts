import type { DivergenceReportSnapshot, SyncEventSnapshot } from "../../sync/interfaces/SyncTypes";
import type { ResolutionStrategy } from "../ResolutionStrategy";

export interface ResolutionDecisionSnapshot {
  strategy: ResolutionStrategy;
  entity: string;
  transactionId: string;
  requiresExecution: false;
}
export interface TransactionRequestSnapshot {
  id: string;
  entity: string;
  source: string;
  destination: string;
  strategy: ResolutionStrategy;
  status: "PREPARED";
  logicalTimestamp: number;
  sourceFingerprint: string;
  destinationFingerprint: string;
}
export type OrchestratorEventType = "SYNC_EVENT_RECEIVED" | "DIVERGENCE_PROCESSED" | "TRANSACTION_PREPARED";
export interface OrchestratorEventSnapshot {
  type: OrchestratorEventType;
  transactionId: string;
  entity: string;
  logicalTimestamp: number;
}
export interface ResolutionContextSnapshot {
  report: DivergenceReportSnapshot;
  syncEvent: SyncEventSnapshot | null;
}
export interface OrchestratorResult {
  decision: ResolutionDecisionSnapshot;
  request: TransactionRequestSnapshot;
  events: OrchestratorEventSnapshot[];
}
