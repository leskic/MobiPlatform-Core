import type { SyncManager } from "../sync/SyncManager";
import type { DivergenceReportSnapshot, SyncEventSnapshot, SyncListener } from "../sync/interfaces/SyncTypes";
import { ConflictResolver } from "./ConflictResolver";
import type { OrchestratorEventSnapshot, OrchestratorResult } from "./interfaces/OrchestratorTypes";
import { OrchestratorEvent } from "./OrchestratorEvent";
import { ResolutionContext } from "./ResolutionContext";
import type { ResolutionStrategy } from "./ResolutionStrategy";
import { TransactionRequest } from "./TransactionRequest";

export class SyncOrchestrator {
  private readonly resolver = new ConflictResolver();
  private readonly events: OrchestratorEventSnapshot[] = [];
  private lastSyncEvent: SyncEventSnapshot | null = null;
  private connected = false;
  private readonly listener: SyncListener = (event) => {
    this.lastSyncEvent = structuredClone(event);
    this.events.push(new OrchestratorEvent(
      "SYNC_EVENT_RECEIVED", event.transactionId, event.entity, event.logicalTimestamp
    ).get());
  };

  constructor(private readonly syncManager: SyncManager) {}

  connect(): void {
    if (this.connected) return;
    this.syncManager.subscribe(this.listener);
    this.connected = true;
  }
  disconnect(): void {
    if (!this.connected) return;
    this.syncManager.unsubscribe(this.listener);
    this.connected = false;
  }
  process(report: DivergenceReportSnapshot, strategy: ResolutionStrategy): OrchestratorResult {
    const context = new ResolutionContext(report, this.lastSyncEvent);
    const decision = this.resolver.select(context, strategy).get();
    const request = new TransactionRequest(report, strategy).get();
    this.events.push(
      new OrchestratorEvent("DIVERGENCE_PROCESSED", report.transactionId, report.entity, report.logicalTimestamp).get(),
      new OrchestratorEvent("TRANSACTION_PREPARED", report.transactionId, report.entity, report.logicalTimestamp).get()
    );
    return { decision, request, events: structuredClone(this.events) };
  }
  getEvents(): OrchestratorEventSnapshot[] { return structuredClone(this.events); }
  clear(): void {
    this.events.length = 0;
    this.lastSyncEvent = null;
  }
}
