import type { SyncState } from "./SyncState";

export class StateMachine {
  private state: SyncState = "DETACHED";
  transition(state: SyncState): SyncState {
    this.state = state;
    return this.state;
  }
  get(): SyncState { return this.state; }
}
