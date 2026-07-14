import type { IndustrialConnectionState } from "./IndustrialConnectionState";
import { IndustrialContractGuard } from "./IndustrialContractGuard";
import type { IndustrialContractSnapshot } from "./IndustrialContracts";
import { IndustrialLifecycle } from "./IndustrialLifecycle";

export class IndustrialIntegrationCoordinator {
  constructor(
    private readonly guard = new IndustrialContractGuard(),
    private readonly lifecycle = new IndustrialLifecycle(),
  ) {}

  connect(
    snapshot: IndustrialContractSnapshot | null | undefined,
  ): IndustrialConnectionState {
    return this.lifecycle.connect(this.guard.validate(snapshot));
  }

  disconnect(): IndustrialConnectionState {
    return this.lifecycle.disconnect();
  }

  getState(): IndustrialConnectionState {
    return this.lifecycle.getState();
  }

  getContracts(): IndustrialContractSnapshot {
    return this.lifecycle.getContracts();
  }
}
