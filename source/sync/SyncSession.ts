import { StateMachine } from "./StateMachine";
import type { SyncSessionSnapshot } from "./interfaces/SyncTypes";

export class SyncSession {
  private id: string | undefined;
  private active = false;
  readonly machine = new StateMachine();
  create(id: string): SyncSessionSnapshot {
    if (id.trim().length === 0) throw new Error("Sync session id cannot be empty");
    this.id = id;
    this.active = true;
    this.machine.transition("SYNCHRONIZED");
    return this.get();
  }
  close(): SyncSessionSnapshot {
    this.requireActive();
    this.active = false;
    this.machine.transition("DETACHED");
    return this.get();
  }
  requireActive(): string {
    if (!this.id || !this.active) throw new Error("No active sync session");
    return this.id;
  }
  get(): SyncSessionSnapshot {
    return { id: this.id ?? "", active: this.active, state: this.machine.get() };
  }
}
