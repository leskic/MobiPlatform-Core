import type { SyncEventSnapshot, SyncListener } from "./interfaces/SyncTypes";
import type { SyncEvent } from "./SyncEvent";

export class SyncObserver {
  private readonly listeners = new Set<SyncListener>();
  subscribe(listener: SyncListener): void { this.listeners.add(listener); }
  unsubscribe(listener: SyncListener): void { this.listeners.delete(listener); }
  publish(event: SyncEvent): void { this.notify(event.get()); }
  notify(event: SyncEventSnapshot): void {
    for (const listener of this.listeners) listener(structuredClone(event));
  }
  clear(): void { this.listeners.clear(); }
}
