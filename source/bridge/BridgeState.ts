import type { MobiOrigin } from "../origin/MobiOrigin";
import type { BridgeSession } from "./BridgeSession";
import type { BridgeStateSnapshot } from "./interfaces/BridgeTypes";

export class BridgeState {
  constructor(
    private readonly origin: MobiOrigin,
    private readonly session: BridgeSession
  ) {}

  get(): BridgeStateSnapshot {
    const hasProject = this.origin.hasProject();
    return {
      session: this.session.has() ? this.session.get() : null,
      hasProject,
      projectId: hasProject ? this.origin.getProject().id : null
    };
  }
}
