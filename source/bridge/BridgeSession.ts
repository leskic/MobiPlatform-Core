import { BridgeEvent } from "./BridgeEvent";
import type { BridgeEventSnapshot, BridgeSessionSnapshot } from "./interfaces/BridgeTypes";

export class BridgeSession {
  private id: string | undefined;
  private open = false;
  private events: BridgeEventSnapshot[] = [];

  create(id: string): BridgeSessionSnapshot {
    this.assertId(id, "session");
    this.id = id;
    this.open = false;
    this.events = [new BridgeEvent("session-created", id).get()];
    return this.get();
  }

  openSession(): BridgeSessionSnapshot {
    const id = this.requireId();
    this.open = true;
    this.record(new BridgeEvent("session-opened", id));
    return this.get();
  }

  close(): BridgeSessionSnapshot {
    const id = this.requireOpenId();
    this.open = false;
    this.record(new BridgeEvent("session-closed", id));
    return this.get();
  }

  record(event: BridgeEvent): void {
    this.events.push(event.get());
  }

  requireOpenId(): string {
    const id = this.requireId();
    if (!this.open) throw new Error("Bridge session is not open");
    return id;
  }

  get(): BridgeSessionSnapshot {
    return {
      id: this.id ?? "",
      open: this.open,
      events: structuredClone(this.events)
    };
  }

  has(): boolean {
    return this.id !== undefined;
  }

  private requireId(): string {
    if (this.id === undefined) throw new Error("Bridge session does not exist");
    return this.id;
  }

  private assertId(id: string, label: string): void {
    if (id.trim().length === 0) throw new Error(`Bridge ${label} id cannot be empty`);
  }
}
