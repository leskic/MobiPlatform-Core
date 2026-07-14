import type { SyncState } from "../SyncState";

export interface FingerprintSnapshot { algorithm: "sha256"; value: string }
export type SyncEventType = "OBSERVED" | "MODIFIED" | "IGNORED" | "DETACHED";
export interface SyncEventSnapshot {
  type: SyncEventType;
  entity: string;
  transactionId: string;
  logicalTimestamp: number;
}
export type SyncListener = (event: SyncEventSnapshot) => void;
export interface SyncSessionSnapshot { id: string; active: boolean; state: SyncState }
export interface DivergenceReportSnapshot {
  entity: string;
  source: string;
  destination: string;
  state: SyncState;
  sourceFingerprint: FingerprintSnapshot;
  destinationFingerprint: FingerprintSnapshot;
  logicalTimestamp: number;
  transactionId: string;
}
