import type { MobiOrigin } from "../origin/MobiOrigin";
import { DivergenceReport } from "./DivergenceReport";
import { FingerprintService } from "./FingerprintService";
import { SyncEvent } from "./SyncEvent";
import { SyncObserver } from "./SyncObserver";
import { SyncSession } from "./SyncSession";
import type { DivergenceReportSnapshot, SyncListener, SyncSessionSnapshot } from "./interfaces/SyncTypes";

export class SyncManager {
  private readonly session = new SyncSession();
  private readonly observer = new SyncObserver();
  private readonly fingerprints = new FingerprintService();
  constructor(private readonly origin: MobiOrigin) {}

  createSession(id: string): SyncSessionSnapshot { return this.session.create(id); }
  closeSession(): SyncSessionSnapshot {
    const result = this.session.close();
    this.observer.clear();
    return result;
  }
  getSession(): SyncSessionSnapshot { return this.session.get(); }
  subscribe(listener: SyncListener): void { this.observer.subscribe(listener); }
  unsubscribe(listener: SyncListener): void { this.observer.unsubscribe(listener); }
  receive(event: SyncEvent): void {
    this.session.requireActive();
    if (event.type === "MODIFIED") this.session.machine.transition("MODIFIED");
    if (event.type === "IGNORED") this.session.machine.transition("IGNORED");
    if (event.type === "DETACHED") this.session.machine.transition("DETACHED");
    this.observer.publish(event);
  }
  fingerprintProject() { return this.fingerprints.generate(this.origin.getProject()); }
  detectDivergence(
    entity: string, source: string, destination: string, sourceValue: unknown, destinationValue: unknown,
    logicalTimestamp: number, transactionId: string
  ): DivergenceReportSnapshot {
    this.session.requireActive();
    const sourceFingerprint = this.fingerprints.generate(sourceValue);
    const destinationFingerprint = this.fingerprints.generate(destinationValue);
    const state = this.fingerprints.compare(sourceFingerprint, destinationFingerprint)
      ? "SYNCHRONIZED" as const : "DIVERGENT" as const;
    this.session.machine.transition(state);
    return new DivergenceReport(
      entity, source, destination, state, sourceFingerprint, destinationFingerprint,
      logicalTimestamp, new SyncEvent("OBSERVED", entity, transactionId, logicalTimestamp).transactionId
    ).get();
  }
}
