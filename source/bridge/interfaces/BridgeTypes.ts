import type { Project } from "../../builder/types/ProjectTypes";

export type BridgeDirection = "export" | "import";
export type BridgeTransactionStatus = "prepared";
export type BridgeEventType =
  | "session-created"
  | "session-opened"
  | "transaction-prepared"
  | "session-closed";

export interface BridgeTransactionSnapshot {
  id: string;
  sessionId: string;
  projectId: string;
  direction: BridgeDirection;
  status: BridgeTransactionStatus;
}

export interface BridgeEventSnapshot {
  type: BridgeEventType;
  sessionId: string;
  transactionId?: string;
}

export interface BridgeSessionSnapshot {
  id: string;
  open: boolean;
  events: BridgeEventSnapshot[];
}

export interface BridgeStateSnapshot {
  session: BridgeSessionSnapshot | null;
  hasProject: boolean;
  projectId: string | null;
}

export interface BridgePreparedProject {
  transaction: BridgeTransactionSnapshot;
  project: Project;
}
